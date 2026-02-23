// In-memory storage
let contacts = [];
let contactIdCounter = 45;

// Mock timeline activities storage
let timelineActivities = {};

// Initialize mock data for testing
const initializeMockData = () => {
  // Create sample contact if none exists
  if (contacts.length === 0) {
    contacts.push({
      id: 45,
      owner: {
        id: 12,
        name: 'Budi Santoso'
      },
      lifecycle_stage: 'contact',
      first_name: 'Andi',
      last_name: 'Pratama',
      email: 'andi.pratama@gmail.com',
      phone_number: '+628123456789',
      converted_at: null,
      created_at: '2026-02-10T10:15:30Z',
      updated_at: '2026-02-10T10:15:30Z',
      professional_info: {
        "account": {
          "id": 3,
          "name": "PT Teknologi Nusantara",
          "phone_number": "+6282224360000",
          "website": "steradian.co.id"
        },
        job_title: 'Software Engineer',
        email: 'andi@company.com',
        phone_number: '+628987654321'
      },
      personal_details: {
        date_of_birth: '1996-04-12',
        school_or_university: 'Universitas Indonesia',
        hobbies: 'running, reading, gaming',
        contact_image_url: 'https://cdn.example.com/contacts/andi.jpg',
        personal_preference_likes: 'coffee, tech podcasts',
        personal_preference_dislikes: 'spicy food'
      },
      assistants: [{
        id: 1,
        assistant_name: 'Siti Rahma',
        email: 'siti.assistant@gmail.com',
        phone_number: '+628111222333'
      }],
      social_medias: {
        instagram: '@andipratama',
        x: '@andiprtm',
        tiktok: null,
        linkedin: 'https://linkedin.com/in/andipratama',
        facebook: null,
        whatsapp: '+628123456789',
        other: null
      },
      addresses: [{
        id: 5,
        address: 'Jl. Sudirman No. 123, Jakarta',
        zip_code: '10220',
        description: 'Primary residence'
      }],
      opportunities: [
        {
          "id": 1,
          "status": "open",
          "value_amount": "Rp 75.000.000",
          "closing_date": "2026-03-12"
        },
        {
          "id": 2,
          "status": "won",
          "value_amount": "Rp 75.000.000",
          "closing_date": "2026-03-12"
        }
      ]
    });
  }

  // Create sample timeline activities for contact 45
  if (!timelineActivities[45]) {
    timelineActivities[45] = [
      {
        id: 1,
        type: 'call',
        created_at: '2026-02-12T10:00:00Z',
        created_by_name: 'Panjul',
        description: 'Follow-up call regarding proposal'
      },
      {
        id: 2,
        type: 'email',
        created_at: '2026-02-12T09:30:00Z',
        created_by_name: 'Panjul',
        description: 'Sent pricing information'
      },
      {
        id: 3,
        type: 'meeting',
        created_at: '2026-02-11T14:00:00Z',
        created_by_name: 'Budi Santoso',
        description: 'Initial discovery meeting'
      },
      {
        id: 4,
        type: 'opportunity',
        created_at: '2026-02-11T11:20:00Z',
        created_by_name: 'Panjul',
        description: 'Created new opportunity - Software License'
      },
      {
        id: 5,
        type: 'note',
        created_at: '2026-02-10T16:45:00Z',
        created_by_name: 'Budi Santoso',
        description: 'Client interested in enterprise plan'
      },
      {
        id: 6,
        type: 'call',
        created_at: '2026-02-09T15:30:00Z',
        created_by_name: 'Panjul',
        description: 'Introductory call'
      },
      {
        id: 7,
        type: 'email',
        created_at: '2026-02-08T11:15:00Z',
        created_by_name: 'Siti Rahma',
        description: 'Sent welcome email'
      }
    ];
  }
};

// Call initialization
initializeMockData();

// Helper function to validate required fields
const validateContactData = (data, isUpdate = false) => {
  const errors = [];
  
  if (!isUpdate) {
    if (!data.owner_id) errors.push('owner_id is required');
    if (!data.first_name) errors.push('first_name is required');
    if (!data.email) errors.push('email is required');
  }
  
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
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

// 1. Create Contact
exports.createContact = (req, res) => {
  try {
    const contactData = req.body;
    
    // Validate required fields
    const validationErrors = validateContactData(contactData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Generate contact ID
    const contactId = ++contactIdCounter;
    
    // Create contact object
    const newContact = {
      id: contactId,
      ...contactData,
      lifecycle_stage: 'contact',
      converted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      owner: {
        id: contactData.owner_id,
        name: 'Budi Santoso' // This would come from a database lookup
      },
      professional_info: {
        account: {
          id: contactData.professional_info?.account_id || null,
          name: contactData.professional_info?.account_id === 3 ? 'PT Teknologi Nusantara' : 'Unknown'
        },
        job_title: contactData.professional_info?.job_title || null,
        email: contactData.professional_info?.email || null,
        phone_number: contactData.professional_info?.phone_number || null
      }
    };
    
    // Store contact (in-memory)
    contacts.push(newContact);
    
    // Initialize empty timeline for new contact
    timelineActivities[contactId] = [];
    
    res.status(201).json({
      error: false,
      code: 201,
      message: 'Contact created successfully'
    });
    
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({
      error: true,
      code: 500,
      message: 'Internal server error'
    });
  }
};

// 2. List Contacts
exports.listContacts = (req, res) => {
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
    
    // Format contacts for list view
    const formattedContacts = contacts.map(contact => ({
      id: contact.id,
      name: `${contact.first_name} ${contact.last_name || ''}`.trim(),
      email: contact.email,
      account_name: contact.professional_info?.account?.name || 'No Account',
      owner_name: contact.owner?.name || 'Unknown Owner',
      last_activite: contact.updated_at || contact.created_at
    }));
    
    // If no contacts in memory, use mock data
    if (formattedContacts.length === 0) {
      const mockContacts = [
        {
          id: 45,
          name: 'Andi Pratama',
          email: 'andi.pratama@gmail.com',
          account_name: 'PT Teknologi Nusantara',
          owner_name: 'Budi Santoso',
          last_activite: '2026-02-08T14:21:00Z'
        },
        {
          id: 46,
          name: 'Siti Aisyah',
          email: 'siti.aisyah@gmail.com',
          account_name: 'CV Digital Solusi',
          owner_name: 'Budi Santoso',
          last_activite: '2026-02-07T09:10:32Z'
        }
      ];
      
      // Sort mock data
      let sortedMockContacts = [...mockContacts];
      if (sort_by === 'name') {
        sortedMockContacts.sort((a, b) => {
          const nameA = a.name.toLowerCase();
          const nameB = b.name.toLowerCase();
          return sort === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        });
      }
      
      // Paginate mock data
      const paginatedData = paginate(sortedMockContacts, pageNum, limitNum);
      
      return res.status(200).json({
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
    }
    
    // Sort data
    let sortedContacts = [...formattedContacts];
    if (sort_by === 'name') {
      sortedContacts.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return sort === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      });
    }
    
    // Paginate
    const paginatedData = paginate(sortedContacts, pageNum, limitNum);
    
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
    console.error('Error listing contacts:', error);
    res.status(500).json({
      error: true,
      code: 500,
      message: 'Internal server error'
    });
  }
};

// 3. Get Contact Detail
exports.getContactDetail = (req, res) => {
  try {
    const { contact_id } = req.params;
    const contactId = parseInt(contact_id);
    
    // Find contact
    const contact = contacts.find(c => c.id === contactId);
    
    if (!contact) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: 'Contact not found'
      });
    }
    
    // Format response according to specification
    const responseData = {
      id: contact.id,
      owner: contact.owner,
      lifecycle_stage: contact.lifecycle_stage,
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email,
      phone_number: contact.phone_number,
      converted_at: contact.converted_at,
      created_at: contact.created_at,
      updated_at: contact.updated_at,
      professional_info: contact.professional_info,
      personal_details: contact.personal_details || {},
      assistants: contact.assistants?.[0] || {}, // Take first assistant
      social_medias: contact.social_medias || {},
      addresses: contact.addresses?.[0] || {}, // Take first address
      opportunities: contact.opportunities || [] 
    };
    
    res.status(200).json({
      error: false,
      code: 200,
      message: 'Success',
      data: responseData
    });
    
  } catch (error) {
    console.error('Error getting contact detail:', error);
    res.status(500).json({
      error: true,
      code: 500,
      message: 'Internal server error'
    });
  }
};

// 12a. Get Contact Overview
exports.getContactOverview = (req, res) => {
  try {
    const { contact_id } = req.params;
    const contactId = parseInt(contact_id);
    
    // Find contact
    const contact = contacts.find(c => c.id === contactId);
    
    if (!contact) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: 'Contact not found'
      });
    }
    
    // Mock opportunity data - in real app, this would come from a database
    // For demonstration, different contacts have different data
    let overviewData;
    
    if (contactId === 45) {
      overviewData = {
        total_opportunities: 12,
        in_progress: 1,
        negotiation: "Rp 75.000.000",
        closed_won: "Rp 300.000.000",
        closed_lost: "Rp 50.000.000"
      };
    } else {
      // Generate dynamic data based on contact ID
      overviewData = {
        total_opportunities: Math.floor(Math.random() * 20) + 5,
        in_progress: Math.floor(Math.random() * 5) + 1,
        negotiation: `Rp ${Math.floor(Math.random() * 100) + 50}.000.000`,
        closed_won: `Rp ${Math.floor(Math.random() * 500) + 100}.000.000`,
        closed_lost: `Rp ${Math.floor(Math.random() * 100) + 10}.000.000`
      };
    }
    
    res.status(200).json({
      error: false,
      code: 200,
      message: 'Success',
      data: overviewData
    });
    
  } catch (error) {
    console.error('Error getting contact overview:', error);
    res.status(500).json({
      error: true,
      code: 500,
      message: 'Internal server error'
    });
  }
};

// 12b. Get Contact Timeline
exports.getContactTimeline = (req, res) => {
  try {
    const { contact_id } = req.params;
    const {
      page = 1,
      limit = 20
    } = req.query;
    
    const contactId = parseInt(contact_id);
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (pageNum < 1 || limitNum < 1) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: 'Invalid pagination parameters'
      });
    }
    
    // Find contact
    const contact = contacts.find(c => c.id === contactId);
    
    if (!contact) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: 'Contact not found'
      });
    }
    
    // Get activities for this contact
    let activities = timelineActivities[contactId] || [];
    
    // If no activities, generate mock data for contact 45
    if (activities.length === 0 && contactId === 45) {
      activities = [
        {
          id: 1,
          type: 'call',
          created_at: '2026-02-12T10:00:00Z',
          created_by_name: 'Panjul',
          description: 'Follow-up call regarding proposal'
        },
        {
          id: 2,
          type: 'email',
          created_at: '2026-02-12T09:30:00Z',
          created_by_name: 'Panjul',
          description: 'Sent pricing information'
        },
        {
          id: 3,
          type: 'meeting',
          created_at: '2026-02-11T14:00:00Z',
          created_by_name: 'Budi Santoso',
          description: 'Initial discovery meeting'
        },
        {
          id: 4,
          type: 'opportunity',
          created_at: '2026-02-11T11:20:00Z',
          created_by_name: 'Panjul',
          description: 'Created new opportunity - Software License'
        },
        {
          id: 5,
          type: 'note',
          created_at: '2026-02-10T16:45:00Z',
          created_by_name: 'Budi Santoso',
          description: 'Client interested in enterprise plan'
        },
        {
          id: 6,
          type: 'call',
          created_at: '2026-02-09T15:30:00Z',
          created_by_name: 'Panjul',
          description: 'Introductory call'
        },
        {
          id: 7,
          type: 'email',
          created_at: '2026-02-08T11:15:00Z',
          created_by_name: 'Siti Rahma',
          description: 'Sent welcome email'
        }
      ];
    }
    
    // Sort activities by date (newest first)
    activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Group activities by date
    const groupedByDate = {};
    
    activities.forEach(activity => {
      const date = activity.created_at.split('T')[0]; // Get YYYY-MM-DD
      
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      
      groupedByDate[date].push({
        type: activity.type,
        created_at: activity.created_at,
        created_by_name: activity.created_by_name,
        description: activity.description
      });
    });
    
    // Convert to array format
    let timelineItems = Object.keys(groupedByDate).map(date => ({
      date,
      activities: groupedByDate[date]
    }));
    
    // Sort by date (newest first)
    timelineItems.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Paginate
    const paginatedData = paginate(timelineItems, pageNum, limitNum);
    
    res.status(200).json({
      error: false,
      code: 200,
      message: 'Success',
      data: {
        items: paginatedData.data,
        pagination: {
          page: paginatedData.page,
          limit: paginatedData.limit,
          total: paginatedData.total,
          totalPages: paginatedData.totalPages,
          hasNext: paginatedData.hasNext,
          hasPrev: paginatedData.hasPrev
        }
      }
    });
    
  } catch (error) {
    console.error('Error getting contact timeline:', error);
    res.status(500).json({
      error: true,
      code: 500,
      message: 'Internal server error'
    });
  }
};

// 4. Delete Contact
exports.deleteContact = (req, res) => {
  try {
    const { contact_id } = req.params;
    const contactId = parseInt(contact_id);
    
    // Find contact index
    const contactIndex = contacts.findIndex(c => c.id === contactId);
    
    if (contactIndex === -1) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: 'Contact not found'
      });
    }
    
    // Remove contact (in-memory)
    contacts.splice(contactIndex, 1);
    
    // Also remove timeline data for this contact
    delete timelineActivities[contactId];
    
    res.status(200).json({
      error: false,
      code: 200,
      message: 'Contact deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({
      error: true,
      code: 500,
      message: 'Internal server error'
    });
  }
};

// 5. Update Contact
exports.updateContact = (req, res) => {
  try {
    const { contact_id } = req.params;
    const contactId = parseInt(contact_id);
    const updateData = req.body;
    
    // Find contact
    const contactIndex = contacts.findIndex(c => c.id === contactId);
    
    if (contactIndex === -1) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: 'Contact not found'
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
    
    // Update contact (in-memory)
    const contact = contacts[contactIndex];
    
    // Update basic fields
    if (updateData.lifecycle_stage !== undefined) contact.lifecycle_stage = updateData.lifecycle_stage;
    if (updateData.first_name !== undefined) contact.first_name = updateData.first_name;
    if (updateData.last_name !== undefined) contact.last_name = updateData.last_name;
    if (updateData.email !== undefined) contact.email = updateData.email;
    if (updateData.phone_number !== undefined) contact.phone_number = updateData.phone_number;
    
    // Update nested objects
    if (updateData.professional_info) {
      contact.professional_info = {
        ...contact.professional_info,
        ...updateData.professional_info,
        account: updateData.professional_info.account_id ? {
          id: updateData.professional_info.account_id,
          name: updateData.professional_info.account_id === 5 ? 'Updated Company' : 'Unknown'
        } : contact.professional_info.account
      };
    }
    
    if (updateData.personal_details) {
      contact.personal_details = {
        ...contact.personal_details,
        ...updateData.personal_details
      };
    }
    
    if (updateData.assistants) {
      // Update first assistant or add new one
      if (contact.assistants && contact.assistants.length > 0) {
        contact.assistants[0] = { ...contact.assistants[0], ...updateData.assistants };
      } else {
        contact.assistants = [updateData.assistants];
      }
    }
    
    if (updateData.social_medias) {
      contact.social_medias = {
        ...contact.social_medias,
        ...updateData.social_medias
      };
    }
    
    if (updateData.addresses) {
      // Update first address or add new one
      if (contact.addresses && contact.addresses.length > 0) {
        contact.addresses[0] = { ...contact.addresses[0], ...updateData.addresses };
      } else {
        contact.addresses = [updateData.addresses];
      }
    }
    
    // Update timestamp
    contact.updated_at = new Date().toISOString();
    
    // Add timeline entry for update
    if (!timelineActivities[contactId]) {
      timelineActivities[contactId] = [];
    }
    
    timelineActivities[contactId].push({
      id: Date.now(),
      type: 'update',
      created_at: new Date().toISOString(),
      created_by_name: 'System',
      description: 'Contact information updated'
    });
    
    res.status(200).json({
      error: false,
      code: 200,
      message: 'Contact updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({
      error: true,
      code: 500,
      message: 'Internal server error'
    });
  }
};

// 7. Get Contact Calls
exports.getContactCalls = (req, res) => {
  try {
    const { contact_id } = req.params;
    const {
      page = 1,
      limit = 20
    } = req.query;
    
    const contactId = parseInt(contact_id);
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (pageNum < 1 || limitNum < 1) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: 'Invalid pagination parameters'
      });
    }
    
    // Find contact
    const contact = contacts.find(c => c.id === contactId);
    
    if (!contact) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: 'Contact not found'
      });
    }
    
    // Mock calls data for contact 45
    let calls = [];
    
    if (contactId === 45) {
      calls = [
        {
          id: 1,
          title: "Introductory call",
          description: "Initial discussion about requirements",
          duration: 15,
          handled_by_name: "Panjul",
          status: "connected",
          created_at: "2026-02-10T10:15:30Z"
        },
        {
          id: 2,
          title: "Follow-up call",
          description: "Client did not answer",
          duration: 0,
          handled_by_name: "Panjul",
          status: "missed",
          created_at: "2026-02-11T09:30:00Z"
        },
        {
          id: 3,
          title: "Contract negotiation call",
          description: "Discussed pricing and terms",
          duration: 25,
          handled_by_name: "Budi Santoso",
          status: "connected",
          created_at: "2026-02-09T14:00:00Z"
        }
      ];
    } else {
      // Generate dynamic calls for other contacts
      calls = generateMockCalls(contactId);
    }
    
    // Sort calls by created_at (newest first)
    calls.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Paginate
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedCalls = calls.slice(startIndex, endIndex);
    
    const pagination = {
      page: pageNum,
      limit: limitNum,
      total: calls.length,
      totalPages: Math.ceil(calls.length / limitNum),
      hasNext: endIndex < calls.length,
      hasPrev: startIndex > 0
    };
    
    res.status(200).json({
      error: false,
      code: 200,
      message: 'Success',
      data: {
        items: paginatedCalls,
        pagination
      }
    });
    
  } catch (error) {
    console.error('Error getting contact calls:', error);
    res.status(500).json({
      error: true,
      code: 500,
      message: 'Internal server error'
    });
  }
};

// 8. Get Contact Emails
exports.getContactEmails = (req, res) => {
  try {
    const { contact_id } = req.params;
    const {
      page = 1,
      limit = 20
    } = req.query;
    
    const contactId = parseInt(contact_id);
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (pageNum < 1 || limitNum < 1) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: 'Invalid pagination parameters'
      });
    }
    
    // Find contact
    const contact = contacts.find(c => c.id === contactId);
    
    if (!contact) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: 'Contact not found'
      });
    }
    
    // Mock emails data for contact 45
    let emails = [];
    
    if (contactId === 45) {
      emails = [
        {
          id: 1,
          title: "Proposal Follow-up",
          description: "Sending proposal document to client",
          to: "client@company.com",
          created_by_name: "Panjul",
          status: "sent",
          attachment_file_url: "https://cdn.example.com/files/proposal.pdf",
          created_at: "2026-02-10T10:15:30Z"
        },
        {
          id: 2,
          title: "Draft email",
          description: "Draft before sending",
          to: "client@company.com",
          created_by_name: "Panjul",
          status: "draft",
          attachment_file_url: null,
          created_at: "2026-02-11T09:00:00Z"
        },
        {
          id: 3,
          title: "Meeting Confirmation",
          description: "Confirming meeting schedule",
          to: "client@company.com",
          created_by_name: "Siti Rahma",
          status: "sent",
          attachment_file_url: "https://cdn.example.com/files/meeting.ics",
          created_at: "2026-02-08T11:30:00Z"
        }
      ];
    } else {
      // Generate dynamic emails for other contacts
      emails = generateMockEmails(contactId);
    }
    
    // Sort emails by created_at (newest first)
    emails.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Paginate
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedEmails = emails.slice(startIndex, endIndex);
    
    const pagination = {
      page: pageNum,
      limit: limitNum,
      total: emails.length,
      totalPages: Math.ceil(emails.length / limitNum),
      hasNext: endIndex < emails.length,
      hasPrev: startIndex > 0
    };
    
    res.status(200).json({
      error: false,
      code: 200,
      message: 'Success',
      data: {
        items: paginatedEmails,
        pagination
      }
    });
    
  } catch (error) {
    console.error('Error getting contact emails:', error);
    res.status(500).json({
      error: true,
      code: 500,
      message: 'Internal server error'
    });
  }
};

// 9. Get Contact Meetings
exports.getContactMeetings = (req, res) => {
  try {
    const { contact_id } = req.params;
    const {
      page = 1,
      limit = 20
    } = req.query;
    
    const contactId = parseInt(contact_id);
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (pageNum < 1 || limitNum < 1) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: 'Invalid pagination parameters'
      });
    }
    
    // Find contact
    const contact = contacts.find(c => c.id === contactId);
    
    if (!contact) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: 'Contact not found'
      });
    }
    
    // Mock meetings data for contact 45
    let meetings = [];
    
    if (contactId === 45) {
      meetings = [
        {
          id: 1,
          title: "Project Kickoff Meeting",
          description: "Initial discussion with stakeholders",
          schedule_date: "2026-02-15",
          schedule_time: "10:00 - 11:00",
          guest: [
            "Budi Santoso",
            "Panjul",
            "Siti"
          ],
          attachment_file_url: "https://cdn.example.com/files/kickoff-agenda.pdf",
          created_by_name: "Panjul",
          status: "upcoming",
          created_at: "2026-02-10T10:15:30Z"
        },
        {
          id: 2,
          title: "Review Meeting",
          description: "Sprint review session",
          schedule_date: "2026-02-10",
          schedule_time: "14:00 - 15:00",
          guest: [
            "Budi Santoso"
          ],
          attachment_file_url: null,
          created_by_name: "Panjul",
          status: "completed",
          created_at: "2026-02-09T09:00:00Z"
        },
        {
          id: 3,
          title: "Planning Session",
          description: "Q2 planning meeting",
          schedule_date: "2026-02-18",
          schedule_time: "13:00 - 15:00",
          guest: [
            "Budi Santoso",
            "Siti Rahma",
            "Panjul",
            "Eka"
          ],
          attachment_file_url: "https://cdn.example.com/files/planning-doc.pdf",
          created_by_name: "Budi Santoso",
          status: "upcoming",
          created_at: "2026-02-12T16:00:00Z"
        }
      ];
    } else {
      // Generate dynamic meetings for other contacts
      meetings = generateMockMeetings(contactId);
    }
    
    // Sort meetings by schedule_date (closest first)
    meetings.sort((a, b) => {
      if (a.status === 'upcoming' && b.status === 'upcoming') {
        return new Date(a.schedule_date) - new Date(b.schedule_date);
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });
    
    // Paginate
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedMeetings = meetings.slice(startIndex, endIndex);
    
    const pagination = {
      page: pageNum,
      limit: limitNum,
      total: meetings.length,
      totalPages: Math.ceil(meetings.length / limitNum),
      hasNext: endIndex < meetings.length,
      hasPrev: startIndex > 0
    };
    
    res.status(200).json({
      error: false,
      code: 200,
      message: 'Success',
      data: {
        items: paginatedMeetings,
        pagination
      }
    });
    
  } catch (error) {
    console.error('Error getting contact meetings:', error);
    res.status(500).json({
      error: true,
      code: 500,
      message: 'Internal server error'
    });
  }
};

// Helper function to generate mock calls
function generateMockCalls(contactId) {
  const callTitles = [
    'Introductory call',
    'Follow-up call',
    'Discovery call',
    'Demo call',
    'Technical discussion',
    'Pricing negotiation',
    'Support call',
    'Onboarding call'
  ];
  
  const statuses = ['connected', 'missed', 'voicemail', 'scheduled', 'completed'];
  const handlers = ['Panjul', 'Budi Santoso', 'Siti Rahma', 'Eka Prasetya'];
  
  const calls = [];
  const now = new Date();
  
  // Generate 2-8 random calls
  const numCalls = Math.floor(Math.random() * 7) + 2;
  
  for (let i = 1; i <= numCalls; i++) {
    const createdDate = new Date(now);
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30));
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const duration = status === 'missed' ? 0 : Math.floor(Math.random() * 45) + 5;
    
    const call = {
      id: i + (contactId * 100),
      title: callTitles[Math.floor(Math.random() * callTitles.length)],
      description: `Sample call description for contact ${contactId}`,
      duration,
      handled_by_name: handlers[Math.floor(Math.random() * handlers.length)],
      status,
      created_at: createdDate.toISOString()
    };
    
    calls.push(call);
  }
  
  return calls;
}

// Helper function to generate mock emails
function generateMockEmails(contactId) {
  const emailTitles = [
    'Proposal',
    'Follow-up',
    'Meeting notes',
    'Contract',
    'Invoice',
    'Welcome email',
    'Newsletter',
    'Product update'
  ];
  
  const statuses = ['sent', 'draft', 'opened', 'clicked', 'bounced', 'scheduled'];
  const senders = ['Panjul', 'Budi Santoso', 'Siti Rahma', 'Eka Prasetya'];
  
  const emails = [];
  const now = new Date();
  
  // Generate 2-8 random emails
  const numEmails = Math.floor(Math.random() * 7) + 2;
  
  for (let i = 1; i <= numEmails; i++) {
    const createdDate = new Date(now);
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30));
    
    const hasAttachment = Math.random() > 0.5;
    
    const email = {
      id: i + (contactId * 100),
      title: emailTitles[Math.floor(Math.random() * emailTitles.length)],
      description: `Sample email content for contact ${contactId}`,
      to: `client${Math.floor(Math.random() * 10)}@company.com`,
      created_by_name: senders[Math.floor(Math.random() * senders.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      attachment_file_url: hasAttachment ? `https://cdn.example.com/files/doc${i}.pdf` : null,
      created_at: createdDate.toISOString()
    };
    
    emails.push(email);
  }
  
  return emails;
}

// Helper function to generate mock meetings
function generateMockMeetings(contactId) {
  const meetingTitles = [
    'Kickoff meeting',
    'Review meeting',
    'Planning session',
    'Demo day',
    'Workshop',
    'Strategy meeting',
    'QBR',
    'Training session'
  ];
  
  const statuses = ['upcoming', 'completed', 'cancelled', 'rescheduled'];
  const organizers = ['Panjul', 'Budi Santoso', 'Siti Rahma', 'Eka Prasetya'];
  const guests = ['Budi Santoso', 'Siti Rahma', 'Panjul', 'Eka Prasetya', 'Dian', 'Rina'];
  
  const meetings = [];
  const now = new Date();
  
  // Generate 2-6 random meetings
  const numMeetings = Math.floor(Math.random() * 5) + 2;
  
  for (let i = 1; i <= numMeetings; i++) {
    const createdDate = new Date(now);
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30));
    
    const scheduleDate = new Date(now);
    scheduleDate.setDate(scheduleDate.getDate() + Math.floor(Math.random() * 20) - 10);
    
    const startHour = Math.floor(Math.random() * 8) + 9;
    const endHour = startHour + Math.floor(Math.random() * 2) + 1;
    
    const numGuests = Math.floor(Math.random() * 4) + 1;
    const selectedGuests = [];
    for (let j = 0; j < numGuests; j++) {
      const guest = guests[Math.floor(Math.random() * guests.length)];
      if (!selectedGuests.includes(guest)) {
        selectedGuests.push(guest);
      }
    }
    
    const hasAttachment = Math.random() > 0.5;
    
    const meeting = {
      id: i + (contactId * 100),
      title: meetingTitles[Math.floor(Math.random() * meetingTitles.length)],
      description: `Sample meeting description for contact ${contactId}`,
      schedule_date: scheduleDate.toISOString().split('T')[0],
      schedule_time: `${startHour.toString().padStart(2, '0')}:00 - ${endHour.toString().padStart(2, '0')}:00`,
      guest: selectedGuests,
      attachment_file_url: hasAttachment ? `https://cdn.example.com/files/meeting-${i}.pdf` : null,
      created_by_name: organizers[Math.floor(Math.random() * organizers.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      created_at: createdDate.toISOString()
    };
    
    meetings.push(meeting);
  }
  
  return meetings;
}

// 6. Get Contact Tasks
exports.getContactTasks = (req, res) => {
  try {
    const { contact_id } = req.params;
    const {
      page = 1,
      limit = 20
    } = req.query;
    
    const contactId = parseInt(contact_id);
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (pageNum < 1 || limitNum < 1) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: 'Invalid pagination parameters'
      });
    }
    
    // Find contact
    const contact = contacts.find(c => c.id === contactId);
    
    if (!contact) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: 'Contact not found'
      });
    }
    
    // Mock tasks data for contact 45
    let tasks = [];
    
    if (contactId === 45) {
      tasks = [
        {
          id: 1,
          title: "Send proposal",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
          due_date: "2026-02-12",
          created_at: "2026-02-10T10:15:30Z",
          status: "upcoming",
          priority: "high",
          assigned_to_name: "Panjul"
        },
        {
          id: 2,
          title: "Send proposal2",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
          due_date: "2026-02-12",
          created_at: "2026-02-10T10:15:30Z",
          status: "done",
          priority: "high",
          assigned_to_name: "Panjul"
        },
        {
          id: 3,
          title: "Send proposal3",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
          due_date: "2026-02-12",
          created_at: "2026-02-10T10:15:30Z",
          status: "overdue",
          priority: "medium",
          assigned_to_name: "Panjul"
        },
        {
          id: 4,
          title: "Send proposal4",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
          due_date: "2026-02-12",
          created_at: "2026-02-10T10:15:30Z",
          status: "in_progress",
          priority: "low",
          assigned_to_name: "Panjul"
        }
      ];
    } else {
      // Generate dynamic tasks for other contacts
      tasks = generateMockTasks(contactId);
    }
    
    // Sort tasks by due_date (closest first) or created_at
    tasks.sort((a, b) => {
      if (a.due_date && b.due_date) {
        return new Date(a.due_date) - new Date(b.due_date);
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });
    
    // Paginate
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedTasks = tasks.slice(startIndex, endIndex);
    
    const pagination = {
      page: pageNum,
      limit: limitNum,
      total: tasks.length,
      totalPages: Math.ceil(tasks.length / limitNum),
      hasNext: endIndex < tasks.length,
      hasPrev: startIndex > 0
    };
    
    res.status(200).json({
      error: false,
      code: 200,
      message: 'Success',
      data: {
        items: paginatedTasks,
        pagination
      }
    });
    
  } catch (error) {
    console.error('Error getting contact tasks:', error);
    res.status(500).json({
      error: true,
      code: 500,
      message: 'Internal server error'
    });
  }
};

// Helper function to generate mock tasks for testing
function generateMockTasks(contactId) {
  const statuses = ['upcoming', 'in_progress', 'done', 'overdue', 'cancelled'];
  const priorities = ['low', 'medium', 'high', 'urgent'];
  const taskTitles = [
    'Follow up email',
    'Schedule meeting',
    'Send contract',
    'Review proposal',
    'Update CRM',
    'Make phone call',
    'Prepare presentation',
    'Send invoice',
    'Collect feedback',
    'Research client'
  ];
  
  const tasks = [];
  const now = new Date();
  
  // Generate 3-12 random tasks
  const numTasks = Math.floor(Math.random() * 10) + 3;
  
  for (let i = 1; i <= numTasks; i++) {
    // Random due date within -10 to +30 days from now
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 40) - 10);
    
    // Random created date within last 30 days
    const createdDate = new Date(now);
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30));
    
    const task = {
      id: i + (contactId * 100),
      title: taskTitles[Math.floor(Math.random() * taskTitles.length)],
      description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
      due_date: dueDate.toISOString().split('T')[0],
      created_at: createdDate.toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      assigned_to_name: ['Panjul', 'Budi Santoso', 'Siti Rahma'][Math.floor(Math.random() * 3)]
    };
    
    tasks.push(task);
  }
  
  return tasks;
}

// 11. Get Contact Activities
exports.getContactActivities = (req, res) => {
  try {
    const { contact_id } = req.params;
    const {
      page = 1,
      limit = 20
    } = req.query;
    
    const contactId = parseInt(contact_id);
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (pageNum < 1 || limitNum < 1) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: 'Invalid pagination parameters'
      });
    }
    
    // Find contact
    const contact = contacts.find(c => c.id === contactId);
    
    if (!contact) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: 'Contact not found'
      });
    }
    
    // Mock activities data for contact 45
    let activities = [];
    
    if (contactId === 45) {
      activities = [
        {
          type: "call",
          id: 10,
          title: "Follow-up call",
          description: "Discuss pricing",
          duration: 20,
          handled_by_name: "Panjul",
          status: "connected",
          created_at: "2026-02-12T10:00:00Z"
        },
        {
          type: "email",
          id: 22,
          title: "Proposal sent",
          description: "Sending proposal document",
          to: "client@company.com",
          created_by_name: "Panjul",
          status: "sent",
          attachment_file_url: "https://cdn.example.com/files/proposal.pdf",
          created_at: "2026-02-11T09:30:00Z"
        },
        {
          type: "meeting",
          id: 5,
          title: "Kickoff Meeting",
          description: "Initial discussion",
          schedule_date: "2026-02-15",
          schedule_time: "10:00 - 11:00",
          guest: ["Budi Santoso", "Siti Rahma"],
          attachment_file_url: null,
          created_by_name: "Panjul",
          status: "upcoming",
          created_at: "2026-02-10T10:15:30Z"
        },
        {
          type: "task",
          id: 3,
          title: "Send proposal",
          description: "Prepare and send proposal",
          due_date: "2026-02-12",
          created_at: "2026-02-10T10:15:30Z",
          status: "upcoming",
          priority: "high",
          assigned_to_name: "Panjul"
        },
        {
          type: "attachment",
          id: 7,
          title: "Signed contract",
          description: "Final signed agreement",
          attachment_file_url: [
            "https://cdn.example.com/files/contract_signed.pdf"
          ],
          created_by_name: "Budi Santoso",
          created_at: "2026-02-09T08:45:00Z"
        }
      ];
    } else {
      // Generate dynamic activities for other contacts
      activities = generateMockActivities(contactId);
    }
    
    // Sort activities by created_at (newest first)
    activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Paginate
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedActivities = activities.slice(startIndex, endIndex);
    
    const pagination = {
      page: pageNum,
      limit: limitNum,
      total: activities.length,
      totalPages: Math.ceil(activities.length / limitNum),
      hasNext: endIndex < activities.length,
      hasPrev: startIndex > 0
    };
    
    res.status(200).json({
      error: false,
      code: 200,
      message: 'Success',
      data: {
        items: paginatedActivities,
        pagination
      }
    });
    
  } catch (error) {
    console.error('Error getting contact activities:', error);
    res.status(500).json({
      error: true,
      code: 500,
      message: 'Internal server error'
    });
  }
};

// Helper function to generate mock activities for testing
function generateMockActivities(contactId) {
  const activityTypes = ['call', 'email', 'meeting', 'task', 'attachment'];
  const statuses = {
    call: ['connected', 'missed', 'voicemail', 'scheduled'],
    email: ['sent', 'opened', 'clicked', 'bounced'],
    meeting: ['upcoming', 'completed', 'cancelled', 'rescheduled'],
    task: ['upcoming', 'in_progress', 'completed', 'overdue'],
    attachment: ['uploaded', 'viewed', 'downloaded']
  };
  
  const titles = {
    call: ['Intro call', 'Follow-up call', 'Discovery call', 'Demo call'],
    email: ['Proposal', 'Follow-up email', 'Meeting notes', 'Contract'],
    meeting: ['Kickoff', 'Review', 'Workshop', 'Presentation'],
    task: ['Send document', 'Update CRM', 'Schedule meeting', 'Research'],
    attachment: ['Contract', 'Proposal', 'NDA', 'Invoice']
  };
  
  const activities = [];
  const now = new Date();
  
  // Generate 5-15 random activities
  const numActivities = Math.floor(Math.random() * 10) + 5;
  
  for (let i = 1; i <= numActivities; i++) {
    const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const statusArray = statuses[type];
    const status = statusArray[Math.floor(Math.random() * statusArray.length)];
    const titleArray = titles[type];
    const title = titleArray[Math.floor(Math.random() * titleArray.length)];
    
    // Random date within last 30 days
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    const activity = {
      type,
      id: i + (contactId * 100),
      title: `${title} - Contact ${contactId}`,
      description: `Sample ${type} description for contact ${contactId}`,
      created_at: date.toISOString(),
      created_by_name: ['Panjul', 'Budi Santoso', 'Siti Rahma'][Math.floor(Math.random() * 3)],
      status
    };
    
    // Add type-specific fields
    switch(type) {
      case 'call':
        activity.duration = Math.floor(Math.random() * 30) + 5;
        activity.handled_by_name = activity.created_by_name;
        break;
      case 'email':
        activity.to = `client${Math.floor(Math.random() * 10)}@company.com`;
        if (Math.random() > 0.5) {
          activity.attachment_file_url = `https://cdn.example.com/files/doc${i}.pdf`;
        }
        break;
      case 'meeting':
        const meetingDate = new Date(date);
        meetingDate.setDate(meetingDate.getDate() + Math.floor(Math.random() * 10));
        activity.schedule_date = meetingDate.toISOString().split('T')[0];
        activity.schedule_time = `${Math.floor(Math.random() * 8) + 9}:00 - ${Math.floor(Math.random() * 8) + 10}:00`;
        activity.guest = ['Budi Santoso', 'Siti Rahma', 'Panjul'].slice(0, Math.floor(Math.random() * 3) + 1);
        break;
      case 'task':
        const dueDate = new Date(date);
        dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 7));
        activity.due_date = dueDate.toISOString().split('T')[0];
        activity.priority = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)];
        activity.assigned_to_name = activity.created_by_name;
        break;
      case 'attachment':
        activity.attachment_file_url = [
          `https://cdn.example.com/files/doc${i}.pdf`
        ];
        break;
    }
    
    activities.push(activity);
  }
  
  return activities;
}

exports.getContactTaskById = (req, res) => {
  try {
    const task = {
      task_id: 1,
      title: "Send proposal",
      notes: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
      due_date: "2026-02-12",
      created_at: "2026-02-10T10:15:30Z",
      status: "upcoming",
      priority: "high",
      assigned_to_name: "Panjul",
      assigned_to_user_id: 1,
      attachment_file_url: "https://cdn.example.com/files/proposal.pdf"
    };
    
    res.status(200).json({
      error: false,
      code: 200,
      message: 'Success',
      data: task
    });
    
  } catch (error) {
    console.error('Error getting contact task:', error);
    res.status(500).json({
      error: true,
      code: 500,
      message: 'Internal server error'
    });
  }
}