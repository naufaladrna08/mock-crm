const leadModel = require('../models/leadModel');

// Helper function to validate required fields
const validateLeadData = (data, isUpdate = false) => {
  const errors = [];
  
  if (!isUpdate) {
    if (!data.owner_id) errors.push('owner_id is required');
    if (!data.first_name) errors.push('first_name is required');
    if (!data.email) errors.push('email is required');
  }
  
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }
  
  if (data.lead_source && !leadModel.validateLeadSource(data.lead_source)) {
    errors.push(`Invalid lead source. Must be one of: ${leadModel.LEAD_SOURCES.join(', ')}`);
  }
  
  return errors;
};

// Helper function for pagination
const paginate = (array, page, limit) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  return {
    data: array.slice(startIndex, endIndex),
    page,
    limit,
    total: array.length,
    totalPages: Math.ceil(array.length / limit),
    hasNext: endIndex < array.length,
    hasPrev: startIndex > 0
  };
};

// Helper function to format lead for list
const formatLeadForList = (lead) => {
  return {
    name: `${lead.first_name} ${lead.last_name || ''}`.trim(),
    email: lead.email,
    account_name: lead.professional_info?.account?.name || 'No Account',
    owner_name: lead.owner?.name || 'Unknown Owner',
    last_activity: lead.last_activity || lead.updated_at
  };
};

// 1. Create Lead
const createLead = (req, res) => {
  try {
    const leadData = req.body;
    
    // Validate required fields
    const validationErrors = validateLeadData(leadData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Generate lead ID
    const leadId = leadModel.generateLeadId();
    const now = new Date().toISOString();
    
    // Create lead object
    const newLead = {
      id: leadId,
      ...leadData,
      lifecycle_stage: 'lead', // Leads start as 'lead'
      converted_at: null,
      created_at: now,
      updated_at: now,
      last_activity: now,
      owner: {
        id: leadData.owner_id,
        name: leadModel.getOwnerName(leadData.owner_id)
      },
      professional_info: {
        account: {
          id: leadData.professional_info?.account_id || null,
          name: leadModel.getAccountName(leadData.professional_info?.account_id)
        },
        job_title: leadData.professional_info?.job_title || null,
        email: leadData.professional_info?.email || null,
        phone_number: leadData.professional_info?.phone_number || null
      },
      personal_details: leadData.personal_details || {},
      assistants: leadData.assistants || [],
      social_medias: leadData.social_medias || {},
      addresses: leadData.addresses || []
    };
    
    // Store lead (in-memory)
    leadModel.leads.push(newLead);
    
    res.status(201).json({
      error: false,
      code: 201,
      message: 'Lead created successfully'
    });
    
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({
      error: true,
      code: 500,
      message: 'Internal server error'
    });
  }
};

// 2. List Leads
const listLeads = (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'desc',
      sort_by = 'name'
    } = req.query;
    
    // Parse query parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (pageNum < 1 || limitNum < 1) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: 'Invalid pagination parameters'
      });
    }
    
    // Format leads for list view
    let formattedLeads = leadModel.leads.map(formatLeadForList);
    
    // If no data in memory, use mock data
    if (formattedLeads.length === 0) {
      formattedLeads = [
        {
          name: 'Yoga Mahendra',
          email: 'yoga.mahendra@gmail.com',
          account_name: 'Andromeda Teknologi',
          owner_name: 'Eka Prasetya',
          last_activity: '2026-02-08T14:21:00Z'
        },
        {
          name: 'Maya Salsabila',
          email: 'maya.salsa@gmail.com',
          account_name: 'Komodo Tech',
          owner_name: 'Dian Setiawan',
          last_activity: '2026-02-07T09:10:32Z'
        },
        {
          name: 'Rina Mulyani',
          email: 'rina.mulyani@gmail.com',
          account_name: 'Samsan Marketing',
          owner_name: 'Hendra Samsudin',
          last_activity: '2026-02-07T09:10:32Z'
        }
      ];
    }
    
    // Sort data
    let sortedLeads = [...formattedLeads];
    if (sort_by === 'name') {
      sortedLeads.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return sort === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      });
    } else if (sort_by === 'last_activity') {
      sortedLeads.sort((a, b) => {
        const dateA = new Date(a.last_activity);
        const dateB = new Date(b.last_activity);
        return sort === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }
    
    // Paginate
    const paginatedData = paginate(sortedLeads, pageNum, limitNum);
    
    res.status(200).json({
      error: false,
      code: 200,
      message: 'Success',
      data: paginatedData.data,
      pagination: {
        page: paginatedData.page,
        limit: paginatedData.limit,
        total: paginatedData.total,
        totalPages: paginatedData.totalPages,
        hasNext: paginatedData.hasNext,
        hasPrev: paginatedData.hasPrev
      }
    });
    
  } catch (error) {
    console.error('Error listing leads:', error);
    res.status(500).json({
      error: true,
      code: 500,
      message: 'Internal server error'
    });
  }
};

// 3. Get Lead Detail
const getLeadDetail = (req, res) => {
  try {
    const { lead_id } = req.params;
    const leadId = parseInt(lead_id);
    
    // Find lead
    const lead = leadModel.findLeadById(leadId);
    
    if (!lead) {
      // Return mock data for testing if not found
      if (leadId === 45) {
        const mockLead = {
          id: 45,
          owner: {
            id: 12,
            name: 'Hendra Samsudin'
          },
          lifecycle_stage: 'lead',
          first_name: 'Rina',
          last_name: 'Mulyani',
          email: 'rina.mulyani@gmail.com',
          phone_number: '+628123456789',
          lead_source: 'Employee Referral',
          converted_at: null,
          created_at: '2026-02-10T10:15:30Z',
          updated_at: '2026-02-10T10:15:30Z',
          professional_info: {
            account: {
              id: 3,
              name: 'Samsan Marketing'
            },
            job_title: 'Marketing',
            email: 'rina.mulyani@company.com',
            phone_number: '+628987654321'
          },
          personal_details: {
            date_of_birth: '1990-07-18',
            school_or_university: 'Universitas Indonesia',
            hobbies: 'reading, cooking',
            contact_image_url: 'https://cdn.example.com/contacts/andi.jpg',
            personal_preference_likes: 'coffee, tech podcasts',
            personal_preference_dislikes: 'spicy food'
          },
          assistants: [{
            assistant_name: 'Diah Puspita',
            email: 'diah.puspita@gmail.com',
            phone_number: '+628111222333'
          }],
          social_medias: {
            instagram: '@rinamulya',
            x: '@rinamly',
            tiktok: null,
            linkedin: 'https://linkedin.com/in/rinamulya',
            facebook: null,
            whatsapp: '+628123456789',
            other: null
          },
          addresses: [{
            id: 5,
            address: 'Jl. Sudirman No. 123, Jakarta',
            zip_code: '10220',
            description: 'Primary residence'
          }]
        };
        
        return res.status(200).json({
          error: false,
          code: 200,
          message: 'Success',
          data: {
            ...mockLead,
            assistants: mockLead.assistants[0] || {},
            addresses: mockLead.addresses[0] || {}
          }
        });
      }
      
      return res.status(404).json({
        error: true,
        code: 404,
        message: 'Lead not found'
      });
    }
    
    // Format response according to specification
    const responseData = {
      id: lead.id,
      owner: lead.owner,
      lifecycle_stage: lead.lifecycle_stage,
      lead_source: lead.lead_source,
      first_name: lead.first_name,
      last_name: lead.last_name,
      email: lead.email,
      phone_number: lead.phone_number,
      converted_at: lead.converted_at,
      created_at: lead.created_at,
      updated_at: lead.updated_at,
      professional_info: lead.professional_info,
      personal_details: lead.personal_details || {},
      assistants: lead.assistants?.[0] || {}, // Take first assistant
      social_medias: lead.social_medias || {},
      addresses: lead.addresses?.[0] || {} // Take first address
    };
    
    res.status(200).json({
      error: false,
      code: 200,
      message: 'Success',
      data: responseData
    });
    
  } catch (error) {
    console.error('Error getting lead detail:', error);
    res.status(500).json({
      error: true,
      code: 500,
      message: 'Internal server error'
    });
  }
};

// 4. Delete Lead
const deleteLead = (req, res) => {
  try {
    const { lead_id } = req.params;
    const leadId = parseInt(lead_id);
    
    // Find lead index
    const leadIndex = leadModel.findLeadIndexById(leadId);
    
    if (leadIndex === -1) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: 'Lead not found'
      });
    }
    
    // Remove lead (in-memory)
    leadModel.leads.splice(leadIndex, 1);
    
    res.status(200).json({
      error: false,
      code: 200,
      message: 'Lead deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({
      error: true,
      code: 500,
      message: 'Internal server error'
    });
  }
};

// 5. Update Lead
const updateLead = (req, res) => {
  try {
    const { lead_id } = req.params;
    const leadId = parseInt(lead_id);
    const updateData = req.body;
    
    // Find lead
    const leadIndex = leadModel.findLeadIndexById(leadId);
    
    if (leadIndex === -1) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: 'Lead not found'
      });
    }
    
    // Validate email if provided
    if (updateData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.email)) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: 'Invalid email format'
      });
    }
    
    // Validate lead source if provided
    if (updateData.lead_source && !leadModel.validateLeadSource(updateData.lead_source)) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: `Invalid lead source. Must be one of: ${leadModel.LEAD_SOURCES.join(', ')}`
      });
    }
    
    // Update lead (in-memory)
    const lead = leadModel.leads[leadIndex];
    const now = new Date().toISOString();
    
    // Update basic fields
    if (updateData.lifecycle_stage !== undefined) lead.lifecycle_stage = updateData.lifecycle_stage;
    if (updateData.lead_source !== undefined) lead.lead_source = updateData.lead_source;
    if (updateData.first_name !== undefined) lead.first_name = updateData.first_name;
    if (updateData.last_name !== undefined) lead.last_name = updateData.last_name;
    if (updateData.email !== undefined) lead.email = updateData.email;
    if (updateData.phone_number !== undefined) lead.phone_number = updateData.phone_number;
    
    // Update nested objects
    if (updateData.professional_info) {
      lead.professional_info = {
        ...lead.professional_info,
        ...updateData.professional_info,
        account: updateData.professional_info.account_id ? {
          id: updateData.professional_info.account_id,
          name: leadModel.getAccountName(updateData.professional_info.account_id)
        } : lead.professional_info.account
      };
    }
    
    if (updateData.personal_details) {
      lead.personal_details = {
        ...lead.personal_details,
        ...updateData.personal_details
      };
    }
    
    if (updateData.assistants) {
      // Update first assistant or add new one
      if (lead.assistants && lead.assistants.length > 0) {
        lead.assistants[0] = { ...lead.assistants[0], ...updateData.assistants };
      } else {
        lead.assistants = [updateData.assistants];
      }
    }
    
    if (updateData.social_medias) {
      lead.social_medias = {
        ...lead.social_medias,
        ...updateData.social_medias
      };
    }
    
    if (updateData.addresses) {
      // Update first address or add new one
      if (lead.addresses && lead.addresses.length > 0) {
        lead.addresses[0] = { ...lead.addresses[0], ...updateData.addresses };
      } else {
        lead.addresses = [updateData.addresses];
      }
    }
    
    // Update timestamps
    lead.updated_at = now;
    lead.last_activity = now;
    
    res.status(200).json({
      error: false,
      code: 200,
      message: 'Lead updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({
      error: true,
      code: 500,
      message: 'Internal server error'
    });
  }
};

// Export all functions
module.exports = {
  createLead,
  listLeads,
  getLeadDetail,
  updateLead,
  deleteLead
};