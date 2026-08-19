export interface ActivityFormData {
  sdlcPhase: string;
  activity: string;
  applicability: string;
  aiAdoptionScore: string;
  aiToolUsed: string | string[];
  clientApproved: string;
  acceleratorsUsed: string | string[];
  workDoneByAI: number;
  hoursSaved: number;
  revenueGenerated: string;
  benefitTo: string;
  qualitativeBenefits: string[];
  comments: string;
}

// Draft entries are auto-saved so data isn't lost if the connection drops; submitted entries are final
export type ActivityStatus = 'draft' | 'submitted';

export interface ActivityData extends ActivityFormData {
  id: string;
  createdAt: Date;
  updatedAt?: Date;
  status?: ActivityStatus;
}

export interface ProjectInfo {
  projectId: string;
  businessUnit: string;
  businessHead: string;
  account: string;
  accountManager: string;
  project: string;
  practice: string;
  manager: string;
  currentPhase: string;
}

// New interface for activities with project information
export interface ActivityWithProjectInfo
  extends ActivityData,
    Pick<
      ProjectInfo,
      'projectId' | 'project' | 'practice' | 'account' | 'businessUnit'
    > {}

export interface QualitativeBenefit {
  value: string;
  label: string;
}

export const QUALITATIVE_BENEFITS: QualitativeBenefit[] = [
  { value: 'Improved Quality', label: 'Improved Quality' },
  { value: 'Faster Delivery', label: 'Faster Delivery' },
  { value: 'Reduced Cost', label: 'Reduced Cost' },
  { value: 'Enhanced Scalability', label: 'Enhanced Scalability' },
  { value: 'Better Compliance', label: 'Better Compliance' },
  { value: 'Improved Accuracy', label: 'Improved Accuracy' },
  { value: 'Increased Efficiency', label: 'Increased Efficiency' },
  { value: 'Reduced Manual Effort', label: 'Reduced Manual Effort' },
  { value: 'Improved Decision-Making', label: 'Improved Decision-Making' },
  {
    value: 'Enhanced Customer Experience',
    label: 'Enhanced Customer Experience',
  },
  { value: 'Improved Risk Management', label: 'Improved Risk Management' },
  {
    value: 'Better Resource Utilization',
    label: 'Better Resource Utilization',
  },
  { value: 'Improved Collaboration', label: 'Improved Collaboration' },
  { value: 'Faster Time to Market', label: 'Faster Time to Market' },
  {
    value: 'Improved Monitoring and Reporting',
    label: 'Improved Monitoring and Reporting',
  },
].sort((a, b) => {
  return a.label.localeCompare(b.label);
});

export const AI_ADOPTION_SCORES = [
  {
    value: '0',
    label: 'No AI Adopted',
    description:
      'No AI tools or techniques are being used. Traditional manual processes are in place.',
  },
  {
    value: '1',
    label: 'Basic Awareness',
    description:
      'The team is aware of AI capabilities, but no implementation has occurred. Planning or research phase.',
  },
  {
    value: '2',
    label: 'Initial Implementation',
    description:
      'Basic AI tools are used occasionally. Limited integration with existing processes.',
  },
  {
    value: '3',
    label: 'Partial Adoption',
    description:
      'AI tools are regularly used and integrated into some workflows. Clear benefits are observed.',
  },
  {
    value: '4',
    label: 'Full Adoption',
    description:
      'AI is deeply integrated into most processes. Significant efficiency gains and innovation.',
  },
  {
    value: '5',
    label: 'Optimized/Automated',
    description:
      'Cutting-edge AI implementation. Industry-leading practices and maximum automation.',
  },
];

// Common AI tools for suggestions
export const COMMON_AI_TOOLS = [
  'ChatGPT',
  'GitHub Copilot',
  'Claude',
  'Bard',
  'Jasper',
  'Copy.ai',
  'Grammarly',
  'Notion AI',
  'Midjourney',
  'DALL-E',
  'Stable Diffusion',
  'OpenAI API',
  'Azure OpenAI',
  'AWS Bedrock',
  'Google AI',
  'Anthropic Claude',
  'Hugging Face',
  'TensorFlow',
  'PyTorch',
  'Scikit-learn',
  'Pandas',
  'NumPy',
  'Matplotlib',
  'Seaborn',
  'Plotly',
  'Jupyter',
  'Google Colab',
  'Kaggle',
  'DataRobot',
  'H2O.ai',
  'RapidMiner',
  'Weka',
  'Orange',
  'KNIME',
  'Alteryx',
  'Tableau',
  'Power BI',
  'Qlik',
  'Looker',
  'Metabase',
  'Apache Spark',
  'Apache Kafka',
  'Apache Airflow',
  'Kubernetes',
  'Docker',
  'Terraform',
  'Ansible',
  'Jenkins',
  'GitLab CI/CD',
  'GitHub Actions',
  'Azure DevOps',
  'AWS CodePipeline',
  'Google Cloud Build',
  'CircleCI',
  'Travis CI',
  'SonarQube',
  'Snyk',
  'Veracode',
  'Checkmarx',
  'Fortify',
  'Burp Suite',
  'OWASP ZAP',
  'Nessus',
  'Qualys',
  'Rapid7',
  'Splunk',
  'ELK Stack',
  'Grafana',
  'Prometheus',
  'Datadog',
  'New Relic',
  'AppDynamics',
  'Dynatrace',
  'PagerDuty',
  'VictorOps',
  'OpsGenie',
  'ServiceNow',
  'Jira',
  'Confluence',
  'Slack',
  'Microsoft Teams',
  'Discord',
  'Zoom',
  'Webex',
  'Google Meet',
  'Miro',
  'Figma',
  'Adobe Creative Suite',
  'Canva',
  'Lucidchart',
  'Draw.io',
  'Visio',
  'Trello',
  'Asana',
  'Monday.com',
  'ClickUp',
  'Notion',
  'Airtable',
  'Google Sheets',
  'Microsoft Excel',
  'Google Docs',
  'Microsoft Word',
  'Google Slides',
  'Microsoft PowerPoint',
  'Prezi',
  'Pitch',
  'Beautiful.ai',
  'Gamma',
  'Tome',
  'Synthesia',
  'Lumen5',
  'InVideo',
  'Pictory',
  'RunwayML',
  'Descript',
  'Audacity',
  'Adobe Audition',
  'GarageBand',
  'Logic Pro',
  'Pro Tools',
  'Reaper',
  'FL Studio',
  'Ableton Live',
  'Cubase',
  'Studio One',
  'Bitwig Studio',
  'Reason',
].sort((a, b) => a.localeCompare(b));

export const REVENUE_GENERATED_OPTIONS = [
  { value: 'No', label: 'No' },
  { value: 'Yes', label: 'Yes' },
];

export const BENEFIT_TO_OPTIONS = [
  { value: 'Neurealm', label: 'Neurealm' },
  { value: 'Customer', label: 'Customer' },
  { value: 'Both', label: 'Both' },
];

export const APPLICABILITY_OPTIONS = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
  { value: 'Activity NA', label: 'Activity NA' },
  { value: 'Customer NA', label: 'Customer NA' },
];

export const CLIENT_APPROVED_OPTIONS = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
];


// Common accelerators for suggestions
export const COMMON_ACCELERATORS = [
  'Azure DevOps',
  'AWS CodePipeline',
  'GitHub Actions',
  'GitLab CI/CD',
  'Jenkins',
  'CircleCI',
  'Travis CI',
  'TeamCity',
  'Bamboo',
  'GoCD',
  'Spinnaker',
  'ArgoCD',
  'Flux',
  'Tekton',
  'Kubernetes',
  'Docker',
  'Terraform',
  'Ansible',
  'Chef',
  'Puppet',
  'Salt',
  'Vagrant',
  'Packer',
  'CloudFormation',
  'ARM Templates',
  'Pulumi',
  'Serverless Framework',
  'AWS SAM',
  'Azure Functions',
  'Google Cloud Functions',
  'Vercel',
  'Netlify',
  'Heroku',
  'DigitalOcean App Platform',
  'Railway',
  'Render',
  'Fly.io',
  'Platform.sh',
  'Dokku',
  'OpenShift',
  'Rancher',
  'EKS',
  'AKS',
  'GKE',
  'Minikube',
  'Kind',
  'K3s',
  'MicroK8s',
  'Istio',
  'Linkerd',
  'Consul',
  'Envoy',
  'Nginx',
  'Apache',
  'HAProxy',
  'Traefik',
  'Caddy',
  "Let's Encrypt",
  'Certbot',
  'Vault',
  'Secrets Manager',
  'AWS KMS',
  'Azure Key Vault',
  'Google Secret Manager',
  'HashiCorp Vault',
  'SonarQube',
  'Snyk',
  'Veracode',
  'Checkmarx',
  'Fortify',
  'OWASP ZAP',
  'Burp Suite',
  'Nessus',
  'Qualys',
  'Rapid7',
  'Splunk',
  'ELK Stack',
  'Grafana',
  'Prometheus',
  'Datadog',
  'New Relic',
  'AppDynamics',
  'Dynatrace',
  'PagerDuty',
  'VictorOps',
  'OpsGenie',
  'ServiceNow',
  'Jira',
  'Confluence',
  'Slack',
  'Microsoft Teams',
  'Discord',
  'Zoom',
  'Webex',
  'Google Meet',
  'Miro',
  'Figma',
  'Adobe Creative Suite',
  'Canva',
  'Lucidchart',
  'Draw.io',
  'Visio',
  'Trello',
  'Asana',
  'Monday.com',
  'ClickUp',
  'Notion',
  'Airtable',
  'Google Sheets',
  'Microsoft Excel',
  'Google Docs',
  'Microsoft Word',
  'Google Slides',
  'Microsoft PowerPoint',
  'Prezi',
  'Pitch',
  'Beautiful.ai',
  'Gamma',
  'Tome',
  'Synthesia',
  'Lumen5',
  'InVideo',
  'Pictory',
  'RunwayML',
  'Descript',
  'Audacity',
  'Adobe Audition',
  'GarageBand',
  'Logic Pro',
  'Pro Tools',
  'Reaper',
  'FL Studio',
  'Ableton Live',
  'Cubase',
  'Studio One',
  'Bitwig Studio',
  'Reason',
];
