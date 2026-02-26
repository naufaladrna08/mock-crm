const getRelatedStats = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      total_opportunities: 2,
      in_progress: 0,
      closed_won: 50000,
      closed_lost: 0,
      active_pipeline_value: 0
    },
    message: 'Opportunity statistics retrieved successfully',
    timestamp: new Date().toISOString()
  });
}

const getRelatedByContactId = (req, res) => {
  res.status(200).json(
    {
      "success": true,
      "data": {
        "data": [
          {
            "opportunityId": 3,
            "opportunityOwnerId": 1,
            "opportunityName": "Startup Inc - Pilot Project",
            "type": "new_business",
            "priority": "low",
            "pipelineId": 2,
            "stageId": 6,
            "probability": 60,
            "startingDate": "2026-02-09T00:00:00Z",
            "closingDate": "2026-03-24T00:00:00Z",
            "valueMetrics": 60,
            "valueAmount": 35000,
            "expectedRevenue": 21000,
            "accountId": "ACC003",
            "relatedTo": "opportunity",
            "relatedToId": 1,
            "nextFollowUp": "2026-02-26T00:00:00Z",
            "nextStep": "Follow up on demo feedback",
            "status": "active",
            "createdAt": "2026-02-09T13:35:40.681518+07:00",
            "updatedAt": "2026-02-24T13:35:40.681518+07:00",
            "createdBy": null,
            "opportunityOwner": {
              "ID": 1,
              "Fullname": "Administrator",
              "PhoneNumber": "",
              "ImageURL": "",
              "ProfileURL": "",
              "BioProfile": "",
              "Address": "",
              "ZipCode": "",
              "JoinedDate": "2026-02-24T15:28:56.08475+07:00",
              "Status": "ACTIVE",
              "RoleID": 1,
              "Authentication": null,
              "Role": null
            }
          },
          {
            "opportunityId": 2,
            "opportunityOwnerId": 2,
            "opportunityName": "XYZ Tech - Software License",
            "type": "existing_business",
            "priority": "medium",
            "pipelineId": 1,
            "stageId": 2,
            "probability": 25,
            "startingDate": "2026-01-24T00:00:00Z",
            "closingDate": "2026-04-24T00:00:00Z",
            "valueMetrics": 80,
            "valueAmount": 75000,
            "expectedRevenue": 18750,
            "accountId": "ACC002",
            "relatedTo": "contact",
            "relatedToId": 205,
            "nextFollowUp": "2026-02-27T00:00:00Z",
            "nextStep": "Send proposal",
            "status": "active",
            "createdAt": "2026-01-24T13:35:40.681518+07:00",
            "updatedAt": "2026-02-24T13:35:40.681518+07:00",
            "createdBy": null
          },
          {
            "opportunityId": 1,
            "opportunityOwnerId": 1,
            "opportunityName": "ABC Corporation - Enterprise Deal",
            "type": "new_business",
            "priority": "high",
            "pipelineId": 3,
            "stageId": 3,
            "probability": 50,
            "startingDate": "2025-12-24T00:00:00Z",
            "closingDate": "2026-05-24T00:00:00Z",
            "valueMetrics": 100,
            "valueAmount": 250000,
            "expectedRevenue": 125000,
            "accountId": "ACC001",
            "relatedTo": "account",
            "relatedToId": 101,
            "nextFollowUp": "2026-03-03T00:00:00Z",
            "nextStep": "Schedule technical demo",
            "dueDate": "2026-03-10T00:00:00Z",
            "status": "active",
            "createdAt": "2025-12-24T13:35:40.681518+07:00",
            "updatedAt": "2026-02-24T13:35:40.681518+07:00",
            "createdBy": null,
            "opportunityOwner": {
              "ID": 1,
              "Fullname": "Administrator",
              "PhoneNumber": "",
              "ImageURL": "",
              "ProfileURL": "",
              "BioProfile": "",
              "Address": "",
              "ZipCode": "",
              "JoinedDate": "2026-02-24T15:28:56.08475+07:00",
              "Status": "ACTIVE",
              "RoleID": 1,
              "Authentication": null,
              "Role": null
            }
          },
          {
            "opportunityId": 4,
            "opportunityOwnerId": 3,
            "opportunityName": "Global Bank - System Upgrade",
            "type": "existing_business",
            "priority": "high",
            "pipelineId": 1,
            "stageId": 4,
            "probability": 75,
            "startingDate": "2025-11-24T00:00:00Z",
            "closingDate": "2026-03-24T00:00:00Z",
            "valueMetrics": 120,
            "valueAmount": 500000,
            "expectedRevenue": 375000,
            "accountId": "ACC004",
            "relatedTo": "account",
            "relatedToId": 104,
            "nextFollowUp": "2026-02-25T00:00:00Z",
            "nextStep": "Final contract review",
            "dueDate": "2026-03-01T00:00:00Z",
            "status": "active",
            "createdAt": "2025-11-24T13:35:40.681518+07:00",
            "updatedAt": "2026-02-24T13:35:40.681518+07:00",
            "createdBy": null
          }
        ],
        "pagination": {
          "page": 1,
          "limit": 10,
          "total": 4,
          "totalPages": 1,
          "hasNext": false,
          "hasPrev": false
        }
      },
      "message": "Opportunities retrieved successfully",
      "timestamp": "2026-02-24T16:04:16.441986778+07:00"
    }

  );
};

module.exports = {
  getRelatedStats,
  getRelatedByContactId
};