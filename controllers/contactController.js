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
        account: {
          id: 3,
          name: 'PT Teknologi Nusantara'
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
      }]
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
      addresses: contact.addresses?.[0] || {} // Take first address
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