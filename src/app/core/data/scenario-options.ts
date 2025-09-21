import { CriteriaType } from '../models/scenario.model'

export const tenantOptions = [
  { id: 'tenant-a', name: 'Tenant A' },
  { id: 'tenant-b', name: 'Tenant B' },
  { id: 'tenant-c', name: 'Tenant C' }
]

export const companyOptions = [
  { id: 'company-a', name: 'Company A' },
  { id: 'company-b', name: 'Company B' },
  { id: 'company-c', name: 'Company C' }
]

export const experienceProductOptions = [
  { id: 'tenant-a', name: 'Tenant A', description: 'Primary tenant experience' },
  { id: 'tenant-b', name: 'Tenant B', description: 'Secondary tenant experience' }
]

export const availableCriteria = [
  { type: CriteriaType.AGE_GROUP, name: 'Age Group' },
  { type: CriteriaType.GENERATION, name: 'Generation' },
  { type: CriteriaType.DEPARTMENT, name: 'Department' },
  { type: CriteriaType.GENDER, name: 'Gender' },
  { type: CriteriaType.LOCATION, name: 'Location' }
]
  
export const criteriaOptions = {
  [CriteriaType.GENDER]: [
    { id: 'male', name: 'Male', type: CriteriaType.GENDER },
    { id: 'female', name: 'Female', type: CriteriaType.GENDER },
    { id: 'other', name: 'Other', type: CriteriaType.GENDER }
  ],
  [CriteriaType.GENERATION]: [
    { id: 'gen-z', name: 'Generation Z', type: CriteriaType.GENERATION },
    { id: 'millennials', name: 'Millennials', type: CriteriaType.GENERATION },
    { id: 'gen-x', name: 'Generation X', type: CriteriaType.GENERATION },
    { id: 'boomers', name: 'Baby Boomers', type: CriteriaType.GENERATION }
  ],
  [CriteriaType.DEPARTMENT]: [
    { id: 'engineering', name: 'Engineering', type: CriteriaType.DEPARTMENT },
    { id: 'hr', name: 'Human Resources', type: CriteriaType.DEPARTMENT },
    { id: 'marketing', name: 'Marketing', type: CriteriaType.DEPARTMENT },
    { id: 'sales', name: 'Sales', type: CriteriaType.DEPARTMENT },
    { id: 'finance', name: 'Finance', type: CriteriaType.DEPARTMENT }
  ],
  [CriteriaType.LOCATION]: [
    { id: 'liverpool', name: 'Liverpool', type: CriteriaType.LOCATION },
    { id: 'manchester', name: 'Manchester', type: CriteriaType.LOCATION },
    { id: 'london', name: 'London', type: CriteriaType.LOCATION },
    { id: 'remote', name: 'Remote', type: CriteriaType.LOCATION }
  ],
  [CriteriaType.AGE_GROUP]: [
    { id: '18-25', name: '18-25', type: CriteriaType.AGE_GROUP },
    { id: '26-35', name: '26-35', type: CriteriaType.AGE_GROUP },
    { id: '36-45', name: '36-45', type: CriteriaType.AGE_GROUP },
    { id: '46-55', name: '46-55', type: CriteriaType.AGE_GROUP },
    { id: '55+', name: '55+', type: CriteriaType.AGE_GROUP }
  ]
}

export const allSurveyData = [
  { id: '1', name: 'Employee Engagement Survey', creationDate: '15/01/2024', startDate: '20/01/2024', endDate: '30/01/2024', selected: false },
  { id: '2', name: 'Employee Promotion Survey', creationDate: '16/01/2024', startDate: '21/01/2024', endDate: '31/01/2024', selected: false },
  { id: '3', name: 'Employee Salary Survey', creationDate: '17/01/2024', startDate: '22/01/2024', endDate: '01/02/2024', selected: false },
  { id: '4', name: 'Customer Satisfaction Survey', creationDate: '18/01/2024', startDate: '23/01/2024', endDate: '02/02/2024', selected: false },
  { id: '5', name: 'Team Performance Survey', creationDate: '19/01/2024', startDate: '24/01/2024', endDate: '03/02/2024', selected: false },
  { id: '6', name: 'Workplace Culture Survey', creationDate: '20/01/2024', startDate: '25/01/2024', endDate: '04/02/2024', selected: false },
  { id: '7', name: 'Leadership Feedback Survey', creationDate: '21/01/2024', startDate: '26/01/2024', endDate: '05/02/2024', selected: false },
  { id: '8', name: 'Training Effectiveness Survey', creationDate: '22/01/2024', startDate: '27/01/2024', endDate: '06/02/2024', selected: false },
  { id: '9', name: 'Benefits Satisfaction Survey', creationDate: '23/01/2024', startDate: '28/01/2024', endDate: '07/02/2024', selected: false },
  { id: '10', name: 'Remote Work Experience Survey', creationDate: '24/01/2024', startDate: '29/01/2024', endDate: '08/02/2024', selected: false },
  { id: '11', name: 'Communication Assessment Survey', creationDate: '25/01/2024', startDate: '30/01/2024', endDate: '09/02/2024', selected: false },
  { id: '12', name: 'Work-Life Balance Survey', creationDate: '26/01/2024', startDate: '31/01/2024', endDate: '10/02/2024', selected: false },
  { id: '13', name: 'Professional Development Survey', creationDate: '27/01/2024', startDate: '01/02/2024', endDate: '11/02/2024', selected: false },
  { id: '14', name: 'Company Values Alignment Survey', creationDate: '28/01/2024', startDate: '02/02/2024', endDate: '12/02/2024', selected: false },
  { id: '15', name: 'Technology Usage Survey', creationDate: '29/01/2024', startDate: '03/02/2024', endDate: '13/02/2024', selected: false },
  { id: '16', name: 'Diversity & Inclusion Survey', creationDate: '30/01/2024', startDate: '04/02/2024', endDate: '14/02/2024', selected: false },
  { id: '17', name: 'Manager Effectiveness Survey', creationDate: '31/01/2024', startDate: '05/02/2024', endDate: '15/02/2024', selected: false },
  { id: '18', name: 'Compensation Satisfaction Survey', creationDate: '01/02/2024', startDate: '06/02/2024', endDate: '16/02/2024', selected: false },
  { id: '19', name: 'Career Growth Opportunities Survey', creationDate: '02/02/2024', startDate: '07/02/2024', endDate: '17/02/2024', selected: false },
  { id: '20', name: 'Employee Recognition Survey', creationDate: '03/02/2024', startDate: '08/02/2024', endDate: '18/02/2024', selected: false },
  { id: '21', name: 'Office Environment Survey', creationDate: '04/02/2024', startDate: '09/02/2024', endDate: '19/02/2024', selected: false },
  { id: '22', name: 'Innovation & Creativity Survey', creationDate: '05/02/2024', startDate: '10/02/2024', endDate: '20/02/2024', selected: false },
  { id: '23', name: 'Change Management Survey', creationDate: '06/02/2024', startDate: '11/02/2024', endDate: '21/02/2024', selected: false },
  { id: '24', name: 'Mental Health & Wellness Survey', creationDate: '07/02/2024', startDate: '12/02/2024', endDate: '22/02/2024', selected: false },
  { id: '25', name: 'Exit Interview Survey', creationDate: '08/02/2024', startDate: '13/02/2024', endDate: '23/02/2024', selected: false }
]