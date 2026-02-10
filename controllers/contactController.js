// In-memory storage (replace with database in production)
let contacts = [];
let contactIdCounter = 45;

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
    
    // Mock data (replace with database query)
    const mockContacts = [
      {
        name: 'Andi Pratama',
        email: 'andi.pratama@gmail.com',
        account_name: 'PT Teknologi Nusantara',
        owner_name: 'Budi Santoso',
        last_activity: '2026-02-08T14:21:00Z'
      },
      {
        name: 'Siti Aisyah',
        email: 'siti.aisyah@gmail.com',
        account_name: 'CV Digital Solusi',
        owner_name: 'Budi Santoso',
        last_activity: '2026-02-07T09:10:32Z'
      },
      // Add more mock data as needed
    ];
    
    // Sort data
    let sortedContacts = [...mockContacts];
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
    
    // Find contact (in-memory lookup)
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