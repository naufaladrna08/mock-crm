// In-memory storage for leads
let leads = [];
let leadIdCounter = 45;

// Lead sources
const LEAD_SOURCES = [
  'Employee Referral',
  'Website',
  'Social Media',
  'Event',
  'Cold Call',
  'Partner',
  'Advertisement',
  'Other'
];

// Helper functions
const generateLeadId = () => ++leadIdCounter;

const findLeadById = (id) => {
  return leads.find(lead => lead.id === id);
};

const findLeadIndexById = (id) => {
  return leads.findIndex(lead => lead.id === id);
};

const validateLeadSource = (source) => {
  return LEAD_SOURCES.includes(source);
};

const getOwnerName = (ownerId) => {
  // Mock owner data - in real app, this would come from a database
  const owners = {
    12: 'Hendra Samsudin',
    13: 'Eka Prasetya',
    14: 'Dian Setiawan',
    15: 'Budi Santoso'
  };
  return owners[ownerId] || 'Unknown Owner';
};

const getAccountName = (accountId) => {
  // Mock account data - in real app, this would come from a database
  const accounts = {
    3: 'Samsan Marketing',
    4: 'Andromeda Teknologi',
    5: 'Komodo Tech',
    6: 'PT Teknologi Nusantara',
    7: 'CV Digital Solusi'
  };
  return accounts[accountId] || 'Unknown Account';
};

// Export functions
module.exports = {
  leads,
  generateLeadId,
  findLeadById,
  findLeadIndexById,
  validateLeadSource,
  getOwnerName,
  getAccountName,
  LEAD_SOURCES
};