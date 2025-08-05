const jobsData = [
  {
  id: 1,
  title: 'Prompt Engineer',
  image: require('../../assets/images/prompt_engineer.png'),
  // img:require('../../assets/images/prompt_bg.png'),
  salary:'₹10 – ₹25 LPA',
  keywordsToSearch: ['ChatGPT', 'LLM', 'Prompt Tuning', 'AI Prompting','Engineer'],
  about:'Prompt Engineers specialize in crafting effective prompts to guide the output of large language models (LLMs) like ChatGPT. They understand how AI interprets language and optimize prompt structures to generate accurate, creative, or insightful responses across various domains.',
  description: [
  "Develop and refine high-quality prompts to optimize LLM output for specific use cases.",
  "Collaborate with AI researchers and developers to design prompt libraries and templates.",
  "Test and evaluate model performance based on different prompt engineering techniques.",
  "Stay updated with advancements in LLMs and prompt tuning methodologies.",
  "Build prompt chains for complex multi-turn tasks and workflows.",
  "Use domain knowledge to create prompts tailored to industry-specific needs.",
  "Analyze and mitigate AI hallucination or bias through careful prompt structuring."
],
  skills: [
    {
      skill: "Natural Language Processing",
      subskills: [
        "Break text into tokens for processing.",
        "Generate embeddings to represent text meaning.",
        "Build models to understand language patterns.",
        "Preprocess text to clean and normalize data.",
        "Identify named entities within text.",
        "Analyze sentiment to gauge emotions.",
        "Generate text based on model predictions.",
        "Perform semantic search to find relevant info."
      ]
    },
    {
      skill: "Large Language Models (LLM)",
      subskills: [
        "Understand transformer-based model architecture.",
        "Fine-tune models for specific tasks.",
        "Design effective prompts for better responses.",
        "Use zero-shot learning for new tasks without training.",
        "Apply few-shot learning with limited examples.",
        "Evaluate model output for quality and accuracy.",
        "Identify and mitigate bias in model predictions.",
        "Integrate models via APIs into applications."
      ]
    },
    {
      skill: "Programming & Scripting",
      subskills: [
        "Write Python scripts to automate workflows.",
        "Use shell scripting for command-line tasks.",
        "Utilize APIs for data and service access.",
        "Automate repetitive tasks to improve efficiency.",
        "Manage code with version control systems.",
        "Parse data from various formats effectively.",
        "Debug code to find and fix errors.",
        "Test scripts to ensure reliability."
      ]
    },
    {
      skill: "Cloud Platforms",
      subskills: [
        "Deploy functions using AWS Lambda.",
        "Use Google Cloud Functions for serverless apps.",
        "Leverage Azure Functions for scalable tasks.",
        "Configure API gateways for secure access.",
        "Ensure cloud security best practices.",
        "Design systems for scalable performance.",
        "Monitor cloud resources and services.",
        "Implement logging for troubleshooting."
      ]
    },
    {
      skill: "Data Annotation & Curation",
      subskills: [
        "Prepare datasets for training and evaluation.",
        "Use labeling tools to annotate data accurately.",
        "Perform quality assurance on annotated data.",
        "Clean data to remove errors and inconsistencies.",
        "Detect and address bias in datasets.",
        "Involve human reviewers in the loop.",
        "Develop clear annotation guidelines.",
        "Manage versions of datasets for tracking."
      ]
    },
    {
      skill: "Communication & Collaboration",
      subskills: [
        "Gather detailed requirements from stakeholders.",
        "Document processes and findings clearly.",
        "Coordinate tasks across multiple teams.",
        "Deliver presentations to share insights.",
        "Incorporate feedback to improve work.",
        "Follow agile methodologies for project work.",
        "Manage projects effectively and timely.",
        "Conduct user testing to validate results."
      ]
    }
  ]
},
{
  id: 2,
  title: 'Data Scientist',
  image: require('../../assets/images/data_scientist.png'),
  salary:'₹10 – ₹20 LPA',
  keywordsToSearch: ['Data Analysis', 'Data', 'Statistics', 'Scientist'],
  about:'A Data Scientist uncovers insights from large datasets using statistics, machine learning, and domain knowledge. Their work helps organizations make informed and data-driven decisions.',
  description: [
  "Collect, clean, and preprocess large volumes of structured and unstructured data",
  "Use statistical methods to analyze data and generate actionable insights",
  "Develop predictive models using machine learning techniques",
  "Visualize data through dashboards and tools like Matplotlib, Seaborn, or Power BI",
  "Communicate findings and recommendations to non-technical stakeholders",
  "Collaborate with data engineers, analysts, and business teams to support data needs",
  "Stay updated with latest tools, technologies, and best practices in data science"
   ],
  skills: [
    {
      skill: "Statistics & Probability",
      subskills: [
        "Summarize data using descriptive statistics.",
        "Draw conclusions using inferential statistics.",
        "Conduct hypothesis testing for decision making.",
        "Apply Bayesian methods for probabilistic reasoning.",
        "Understand and use different probability distributions.",
        "Use sampling techniques to represent populations.",
        "Perform regression analysis to model relationships.",
        "Analyze variance with ANOVA tests."
      ]
    },
    {
      skill: "Python for Data Science",
      subskills: [
        "Manipulate data using Pandas library.",
        "Perform numerical operations with NumPy.",
        "Visualize data through Matplotlib plots.",
        "Create statistical charts using Seaborn.",
        "Build and evaluate models with Scikit-learn.",
        "Work interactively in Jupyter Notebooks.",
        "Clean and preprocess raw data effectively.",
        "Engineer features to improve model accuracy."
      ]
    },
    {
      skill: "Machine Learning",
      subskills: [
        "Implement supervised learning algorithms.",
        "Explore data patterns with unsupervised learning.",
        "Evaluate model performance using metrics.",
        "Select important features for models.",
        "Use cross-validation to prevent overfitting.",
        "Apply clustering to group similar data points.",
        "Reduce dimensionality to simplify data.",
        "Combine models with ensemble techniques."
      ]
    },
    {
      skill: "Big Data Tools",
      subskills: [
        "Process large datasets using Hadoop.",
        "Run in-memory data processing with Spark.",
        "Manage real-time data streams using Kafka.",
        "Work with NoSQL databases for flexible data storage.",
        "Design and maintain data warehouses.",
        "Perform ETL processes to prepare data.",
        "Leverage cloud data services for scalability.",
        "Build and maintain efficient data pipelines."
      ]
    },
    {
      skill: "Data Visualization",
      subskills: [
        "Create interactive dashboards with Tableau.",
        "Build business reports using Power BI.",
        "Design insightful dashboards for stakeholders.",
        "Tell stories through data visualization.",
        "Use Plotly for dynamic charting.",
        "Develop interactive charts to explore data.",
        "Generate comprehensive reports.",
        "Build visualizations with D3.js library."
      ]
    },
    {
      skill: "SQL & Databases",
      subskills: [
        "Optimize queries for faster results.",
        "Join tables to combine related data.",
        "Create indexes to improve database speed.",
        "Write stored procedures for reusable logic.",
        "Apply normalization to organize data efficiently.",
        "Manage transactions to ensure data consistency.",
        "Backup and restore databases reliably.",
        "Design data models for application needs."
      ]
    }
  ]
},
  {
  id: 3,
  title: 'AI/ML Engineer',
  image: require('../../assets/images/ai_ml.jpg'),
  salary:'₹8 – ₹18 LPA',
  keywordsToSearch: ['AI', 'Machine Learning', 'Artificial Intelligence', 'ML', 'Engineer'],
  about:'An AI/ML Engineer builds systems that learn from data to make intelligent decisions. They work on algorithms, data processing, and model deployment in real-world applications.',
  description: [
  "Design and develop machine learning algorithms and models",
  "Clean, preprocess, and analyze large datasets",
  "Implement deep learning frameworks like TensorFlow and PyTorch",
  "Train and evaluate models for accuracy and performance",
  "Collaborate with teams to integrate models into applications",
  "Continuously improve model efficiency and scalability"
  ],
  skills: [
    {
      skill: "Python",
      subskills: [
        "Work with variables and understand different data types.",
        "Create functions and apply object-oriented programming concepts.",
        "Handle exceptions to manage errors gracefully.",
        "Use list comprehensions for concise data processing.",
        "Manipulate data efficiently using Pandas.",
        "Perform numerical operations with NumPy.",
        "Build machine learning models with Scikit-learn.",
        "Visualize data using Matplotlib."
      ]
    },
    {
      skill: "TensorFlow / PyTorch",
      subskills: [
        "Create and manipulate tensors for data representation.",
        "Build neural network layers for model architecture.",
        "Optimize models using various optimizers.",
        "Define loss functions to measure model errors.",
        "Implement backpropagation for training models.",
        "Utilize GPUs to speed up training.",
        "Design custom layers for advanced modeling.",
        "Apply transfer learning to reuse pre-trained models."
      ]
    },
    {
      skill: "Data Structures & Algorithms",
      subskills: [
        "Understand and use arrays for data storage.",
        "Implement stacks for LIFO operations.",
        "Use queues for FIFO data processing.",
        "Work with linked lists for dynamic data structures.",
        "Apply graphs for relationship modeling.",
        "Traverse and manipulate trees for hierarchical data.",
        "Sort data using various algorithms.",
        "Solve problems using dynamic programming techniques."
      ]
    },
    {
      skill: "Machine Learning Models",
      subskills: [
        "Build predictive models using linear regression.",
        "Use logistic regression for classification problems.",
        "Create decision trees for interpretable models.",
        "Combine trees in random forests to improve accuracy.",
        "Apply k-nearest neighbors for instance-based learning.",
        "Use naive Bayes for probabilistic classification.",
        "Train support vector machines for classification tasks.",
        "Perform clustering to find data groupings."
      ]
    },
    {
      skill: "Cloud Platforms",
      subskills: [
        "Manage access using Identity and Access Management (IAM).",
        "Launch and maintain virtual machines like EC2 instances.",
        "Store and retrieve data using cloud storage solutions.",
        "Deploy serverless functions for event-driven computing.",
        "Integrate APIs to connect cloud services.",
        "Implement load balancing to distribute traffic.",
        "Configure virtual private clouds (VPC) for network isolation.",
        "Set up CI/CD pipelines for automated deployments."
      ]
    },
    {
      skill: "SQL & NoSQL",
      subskills: [
        "Perform CRUD operations to manage databases.",
        "Use joins to combine data from multiple tables.",
        "Create indexes to speed up queries.",
        "Apply normalization to reduce data redundancy.",
        "Design schemas for MongoDB collections.",
        "Manage transactions to ensure data integrity.",
        "Aggregate data for analytics purposes.",
        "Create views to simplify complex queries."
      ]
    }
  ]
},
{
  id: 4,
  title: 'Blockchain Developer',
  image: require('../../assets/images/block_chain.jpg'),
  salary:'₹8 – ₹18 LPA',
  keywordsToSearch: ['Ethereum', 'Smart Contracts', 'Solidity', 'Blockchain', 'Developer'],
  about:'Blockchain Developers create decentralized applications and smart contracts on blockchain platforms. They work on the backend of blockchain systems, ensuring secure, transparent, and tamper-proof transactions.',
  description: [
  "Design and develop smart contracts using Solidity or Rust.",
  "Build decentralized apps (dApps) on Ethereum, Solana, or other blockchain platforms.",
  "Ensure security and gas optimization in blockchain transactions.",
  "Integrate Web3 technologies and APIs with front-end applications.",
  "Test, debug, and audit smart contracts to prevent vulnerabilities.",
  "Maintain and upgrade blockchain infrastructure and nodes.",
  "Keep up with industry trends like Layer 2 scaling, DeFi, and NFTs."
],
  skills: [
    {
      skill: "Blockchain Fundamentals",
      subskills: [
        "Understand distributed ledger technology for decentralized record-keeping.",
        "Implement consensus algorithms to validate transactions.",
        "Apply cryptographic techniques to secure data.",
        "Use hash functions to ensure data integrity.",
        "Manage public and private keys for secure identity verification.",
        "Work with peer-to-peer network protocols to enable decentralization.",
        "Design and deploy smart contracts for automated agreements.",
        "Create and manage tokens within blockchain ecosystems."
      ]
    },
    {
      skill: "Smart Contract Development",
      subskills: [
        "Write smart contracts using Solidity programming language.",
        "Use Truffle framework for smart contract development and testing.",
        "Deploy local blockchain environments with Ganache.",
        "Utilize OpenZeppelin libraries for secure contract development.",
        "Perform rigorous testing and debugging of smart contracts.",
        "Optimize smart contracts to reduce gas consumption.",
        "Conduct security audits to identify vulnerabilities.",
        "Implement upgradeable contracts for maintainability."
      ]
    },
    {
      skill: "Blockchain Platforms",
      subskills: [
        "Develop on Ethereum blockchain for decentralized applications.",
        "Work with Binance Smart Chain to leverage fast transactions.",
        "Use Polygon to build scalable Layer 2 solutions.",
        "Understand Hyperledger for permissioned blockchain networks.",
        "Build solutions on Corda for enterprise blockchain applications.",
        "Develop on EOS for high-performance blockchain apps.",
        "Explore Tezos for formal verification of smart contracts.",
        "Leverage Cardano’s proof-of-stake blockchain for secure apps."
      ]
    },
    {
      skill: "DApp Development",
      subskills: [
        "Integrate Web3.js library for blockchain interaction.",
        "Use Ethers.js for Ethereum blockchain communication.",
        "Combine React with blockchain data for responsive UIs.",
        "Store and retrieve data using IPFS decentralized storage.",
        "Enable user authentication via Metamask wallet.",
        "Build Node.js backend services to support DApps.",
        "Implement wallet integrations for user transactions.",
        "Use oracles to connect blockchain data with real-world events."
      ]
    },
    {
      skill: "Security",
      subskills: [
        "Prevent reentrancy attacks to secure smart contracts.",
        "Avoid overflow and underflow vulnerabilities.",
        "Mitigate front-running attacks in transaction processing.",
        "Implement access control mechanisms for contract functions.",
        "Use multi-signature wallets for enhanced security.",
        "Conduct thorough contract audits to find bugs.",
        "Participate in bug bounty programs for vulnerability discovery.",
        "Perform penetration testing on blockchain applications."
      ]
    },
    {
      skill: "Development Tools",
      subskills: [
        "Develop and test contracts using Remix IDE.",
        "Use Hardhat for Ethereum development automation.",
        "Leverage VS Code as the primary code editor.",
        "Run Ganache for personal Ethereum blockchain simulation.",
        "Manage contract lifecycle with Truffle Suite.",
        "Verify contracts and transactions with Etherscan.",
        "Utilize blockchain explorers to monitor blockchain state.",
        "Maintain version control with Git and related tools."
      ]
    }
  ]
},
{
  id: 5,
  title: 'DevOps Engineer',
  image: require('../../assets/images/Devops.jpg'),
  salary:'₹9 – ₹17 LPA',
  keywordsToSearch: ['CI/CD', 'Docker', 'Kubernetes', 'Automation', 'Devops', 'Engineer'],
  about:'DevOps Engineers merge software development with IT operations to automate and streamline code deployments. They build CI/CD pipelines, maintain system reliability, and improve development-to-release cycles.',
  description: [
  "Develop and maintain CI/CD pipelines for automated deployments.",
  "Monitor system performance and troubleshoot production issues.",
  "Automate configuration and infrastructure provisioning using tools like Terraform or Ansible.",
  "Implement logging, monitoring, and alerting systems (e.g., Prometheus, Grafana).",
  "Ensure system security and compliance during deployment cycles.",
  "Work closely with developers to support microservices and containerized environments.",
  "Manage version control systems and branching strategies (e.g., Git)."
],
  skills: [
    {
      skill: "CI/CD Tools",
      subskills: [
        "Set up and maintain Jenkins pipelines for continuous integration and deployment.",
        "Configure GitLab CI for automated build and test workflows.",
        "Use Travis CI to run tests and deployments automatically.",
        "Leverage CircleCI for scalable continuous delivery.",
        "Manage build and release pipelines using Azure DevOps.",
        "Automate deployments with AWS CodeDeploy.",
        "Integrate automated testing into CI/CD workflows.",
        "Design efficient and reliable build pipelines."
      ]
    },
    {
      skill: "Containerization",
      subskills: [
        "Create and manage Docker containers for application packaging.",
        "Use Docker Compose to define and run multi-container applications.",
        "Optimize Docker images for faster builds and smaller size.",
        "Configure container networking to enable communication between containers.",
        "Manage persistent storage with Docker volumes.",
        "Implement container security best practices.",
        "Operate container registries to store and distribute images.",
        "Deploy and manage Docker Swarm clusters."
      ]
    },
    {
      skill: "Orchestration",
      subskills: [
        "Deploy and manage applications using Kubernetes clusters.",
        "Package Kubernetes applications with Helm charts.",
        "Control pod scheduling to optimize resource usage.",
        "Implement service discovery for dynamic environments.",
        "Configure load balancing to distribute traffic effectively.",
        "Scale containerized applications based on demand.",
        "Manage configuration using ConfigMaps.",
        "Secure sensitive data with Kubernetes Secrets management."
      ]
    },
    {
      skill: "Monitoring & Logging",
      subskills: [
        "Use Prometheus to collect and query system metrics.",
        "Create visual monitoring dashboards with Grafana.",
        "Aggregate and analyze logs using the ELK stack (Elasticsearch, Logstash, Kibana).",
        "Monitor logs and events with Splunk for enterprise environments.",
        "Set up alerting systems to detect anomalies.",
        "Aggregate logs from multiple sources for centralized analysis.",
        "Implement distributed tracing to follow request flows.",
        "Build dashboards for real-time insights into system health."
      ]
    },
    {
      skill: "Infrastructure Automation",
      subskills: [
        "Automate infrastructure provisioning with Terraform scripts.",
        "Use Ansible for configuration management and deployment automation.",
        "Manage AWS resources using CloudFormation templates.",
        "Deploy and configure systems with Puppet.",
        "Automate server setups using Chef.",
        "Write scripts to automate repetitive tasks and workflows.",
        "Maintain version control for automation code.",
        "Ensure idempotency in automation scripts to avoid errors."
      ]
    },
    {
      skill: "Cloud Services",
      subskills: [
        "Deploy and manage cloud resources in AWS environments.",
        "Use Azure cloud services to build and maintain applications.",
        "Manage Google Cloud Platform resources and services.",
        "Implement serverless functions for event-driven workflows.",
        "Configure Identity and Access Management (IAM) for secure access.",
        "Manage virtual networks and cloud networking components.",
        "Set up cloud storage solutions for scalable data management.",
        "Apply cloud security best practices to protect assets."
      ]
    }
  ]
},
{
  id: 6,
  title: 'Cloud Engineer',
  image: require('../../assets/images/cloud.png'),
  salary:'₹8 – ₹16 LPA',
  keywordsToSearch: ['AWS', 'Azure', 'Cloud Architecture','Engineer','Cloud'],
  about:'Cloud Engineers are responsible for designing, deploying, and managing cloud-based infrastructure and services. They ensure scalable, secure, and cost-effective solutions for organizations using platforms like AWS, Azure, and Google Cloud.',
  description: [
  "Develop and manage scalable cloud infrastructure using AWS, Azure, or GCP.",
  "Implement cloud security and backup solutions.",
  "Migrate on-premise systems to the cloud with minimal downtime.",
  "Automate cloud services using scripts and Infrastructure as Code (IaC).",
  "Monitor cloud systems to ensure performance and availability.",
  "Collaborate with developers to deploy applications via CI/CD pipelines.",
  "Optimize cloud costs through performance tuning and resource management."
],
  skills: [
    {
      skill: "Cloud Platforms",
      subskills: [
        "Launch and manage AWS EC2 instances for computing needs.",
        "Set up and maintain Azure Virtual Machines for applications.",
        "Use Google Cloud Compute Engine for scalable workloads.",
        "Configure cloud storage solutions for reliable data access.",
        "Implement serverless architecture to reduce overhead.",
        "Manage cloud networking components for secure connectivity.",
        "Control access with Identity and Access Management (IAM).",
        "Distribute traffic using load balancing techniques."
      ]
    },
    {
      skill: "Infrastructure as Code",
      subskills: [
        "Write Terraform scripts to automate infrastructure provisioning.",
        "Use CloudFormation templates for AWS resource management.",
        "Deploy configurations with Ansible for automation.",
        "Manage system configurations using Puppet.",
        "Automate server setup with Chef.",
        "Containerize applications using Docker.",
        "Orchestrate containers with Kubernetes clusters.",
        "Deploy applications with Helm charts for Kubernetes."
      ]
    },
    {
      skill: "CI/CD",
      subskills: [
        "Create automated pipelines using Jenkins.",
        "Set up continuous integration with GitLab CI.",
        "Use CircleCI for streamlined deployments.",
        "Manage build and release pipelines in Azure DevOps.",
        "Configure AWS CodePipeline for deployment workflows.",
        "Write automation scripts to support CI/CD processes.",
        "Monitor pipeline health and performance.",
        "Set up alerting for build failures and deployment issues."
      ]
    },
    {
      skill: "Security & Compliance",
      subskills: [
        "Define and enforce IAM policies for resource access.",
        "Configure security groups to control inbound/outbound traffic.",
        "Implement encryption to protect data in transit and at rest.",
        "Enable audit logging to track user activities.",
        "Ensure compliance with industry security standards.",
        "Perform vulnerability scanning to detect risks.",
        "Manage secrets securely, including API keys and passwords.",
        "Apply network security best practices to protect cloud assets."
      ]
    },
    {
      skill: "Containerization & Orchestration",
      subskills: [
        "Build and manage Docker containers for application packaging.",
        "Deploy and scale applications using Kubernetes clusters.",
        "Use Helm charts to package Kubernetes applications.",
        "Manage pod lifecycle and resource allocation.",
        "Scale containerized applications based on demand.",
        "Balance loads across containers for availability.",
        "Implement service mesh to control microservice communication.",
        "Integrate CI/CD pipelines for container deployments."
      ]
    },
    {
      skill: "Monitoring & Logging",
      subskills: [
        "Set up AWS CloudWatch for performance monitoring.",
        "Use Prometheus to collect and query metrics.",
        "Create visual dashboards with Grafana.",
        "Aggregate logs with the ELK stack (Elasticsearch, Logstash, Kibana).",
        "Configure alerting systems to notify on issues.",
        "Implement distributed tracing to monitor request flows.",
        "Collect and aggregate logs from various sources.",
        "Build dashboards for real-time infrastructure insights."
      ]
    }
  ]
},
{
  id: 7,
  title: 'Cybersecurity Analyst',
  image: require('../../assets/images/cyber.jpg'),
  salary:'₹7 – ₹14 LPA',
  keywordsToSearch: ['Network Security', 'Threat Detection', 'Firewalls','Security'],
  about:"Cybersecurity Analysts are digital defenders who identify and address potential threats to an organization's networks, systems, and data. They help prevent, detect, and respond to cyberattacks, ensuring data confidentiality and compliance with regulations.",
  description: [
  "Monitor networks and systems for security breaches or unusual activity.",
  "Conduct vulnerability assessments and penetration testing.",
  "Implement security policies, protocols, and best practices.",
  "Respond to incidents and investigate breaches using forensic tools.",
  "Maintain firewalls, encryption protocols, and other security measures.",
  "Prepare security reports and risk assessments for stakeholders.",
  "Stay updated on emerging threats and recommend security upgrades."
],
  skills: [
    {
      skill: "Network Security",
      subskills: [
        "Configure and manage firewalls to control network access.",
        "Set up VPNs for secure remote connections.",
        "Detect intrusions using specialized tools.",
        "Continuously monitor network traffic for anomalies.",
        "Analyze packets to identify malicious activity.",
        "Implement network segmentation to limit breaches.",
        "Use secure protocols to protect data in transit.",
        "Utilize Wireshark for packet capture and analysis."
      ]
    },
    {
      skill: "Threat Analysis",
      subskills: [
        "Analyze malware to understand its behavior.",
        "Detect phishing attempts and educate users.",
        "Assess vulnerabilities in systems and applications.",
        "Conduct penetration tests to find security gaps.",
        "Manage risks by prioritizing threats and responses.",
        "Gather and analyze threat intelligence data.",
        "Use SIEM tools to correlate and monitor security events.",
        "Respond quickly to security incidents and breaches."
      ]
    },
    {
      skill: "Security Compliance",
      subskills: [
        "Ensure adherence to ISO 27001 security standards.",
        "Implement GDPR rules for data privacy compliance.",
        "Follow HIPAA regulations for healthcare data security.",
        "Apply NIST frameworks for cybersecurity best practices.",
        "Perform security audits to check compliance.",
        "Develop and enforce security policies and procedures.",
        "Control access to sensitive data and systems.",
        "Conduct security training to raise awareness."
      ]
    },
    {
      skill: "Cryptography",
      subskills: [
        "Use encryption algorithms to secure data.",
        "Manage Public Key Infrastructure (PKI) systems.",
        "Implement digital signatures for data integrity.",
        "Apply hash functions for secure data verification.",
        "Configure SSL/TLS for secure communications.",
        "Handle cryptographic key management.",
        "Manage digital certificates and their lifecycle.",
        "Secure VPNs using cryptographic protocols."
      ]
    },
    {
      skill: "Endpoint Security",
      subskills: [
        "Deploy antivirus software to detect threats.",
        "Use Endpoint Detection & Response (EDR) tools.",
        "Manage patch updates to fix vulnerabilities.",
        "Secure mobile devices with appropriate controls.",
        "Implement data loss prevention strategies.",
        "Control application usage on endpoints.",
        "Enforce user authentication policies.",
        "Set up multi-factor authentication for access."
      ]
    },
    {
      skill: "Cloud Security",
      subskills: [
        "Manage Identity and Access Management (IAM) roles.",
        "Configure cloud firewalls to protect resources.",
        "Set up security groups for network control.",
        "Encrypt data stored in the cloud (encryption at rest).",
        "Monitor cloud environments for security events.",
        "Implement identity federation for seamless access.",
        "Ensure cloud service compliance with regulations.",
        "Perform security audits on cloud infrastructure."
      ]
    }
  ]
},
{
  id: 8,
  title: 'Full Stack Developer',
  image: require('../../assets/images/fsd.png'),
  salary:'₹6 – ₹12 LPA',
  keywordsToSearch: ['Frontend', 'Backend', 'Full Stack Developer', 'Developer', 'Full Stack'],
  about:'A Full Stack Developer creates complete web applications by handling both front-end and back-end development. They ensure smooth integration between user interface, server, and database systems.',
  description: [
  "Build responsive UI using HTML, CSS, JavaScript, and React",
  "Create RESTful APIs using Node.js and Express",
  "Design and manage databases like MongoDB and SQL",
  "Integrate front-end and back-end services seamlessly",
  "Perform unit testing, debugging, and deployment",
  "Collaborate with cross-functional teams using agile methods"
   ],
  skills: [
    {
      skill: "HTML, CSS, JavaScript",
      subskills: [
        "Understand and use semantic HTML elements.",
        "Create responsive layouts using CSS Flexbox.",
        "Build grid-based layouts with CSS Grid.",
        "Implement animations to enhance UI experience.",
        "Manipulate the DOM to update page content dynamically.",
        "Handle user interactions using JavaScript events.",
        "Use modern JavaScript ES6 features effectively.",
        "Fetch data asynchronously using the Fetch API."
      ]
    },
    {
      skill: "React.js / Angular",
      subskills: [
        "Build reusable UI components.",
        "Manage data flow using props and state.",
        "Utilize hooks for state and lifecycle management.",
        "Implement client-side routing for navigation.",
        "Use Redux for centralized state management.",
        "Leverage Context API to share data globally.",
        "Handle form inputs and validations.",
        "Optimize performance with lazy loading components."
      ]
    },
    {
      skill: "Node.js / Express.js",
      subskills: [
        "Create server-side routing for APIs.",
        "Use middleware to handle requests and responses.",
        "Implement JWT for secure authentication.",
        "Interact with MongoDB using Mongoose ORM.",
        "Handle errors gracefully in backend code.",
        "Support file uploads in applications.",
        "Manage user sessions for stateful interactions.",
        "Configure CORS to allow cross-origin requests."
      ]
    },
    {
      skill: "MongoDB / SQL",
      subskills: [
        "Design schemas for database collections and tables.",
        "Define relationships between data entities.",
        "Create indexes to improve query performance.",
        "Perform data aggregation for complex queries.",
        "Use transactions to maintain data integrity.",
        "Model data to fit application needs.",
        "Apply normalization to reduce data redundancy.",
        "Backup and restore databases securely."
      ]
    },
    {
      skill: "Git & GitHub",
      subskills: [
        "Manage code with branching strategies.",
        "Merge code changes safely across branches.",
        "Create pull requests for code reviews.",
        "Use rebase to maintain clean commit history.",
        "Resolve conflicts during merges.",
        "Tag releases for versioning.",
        "Automate workflows using GitHub Actions.",
        "Maintain version control for collaboration."
      ]
    },
    {
      skill: "RESTful APIs",
      subskills: [
        "Develop CRUD endpoints for resources.",
        "Use HTTP status codes appropriately.",
        "Implement authentication mechanisms.",
        "Test APIs using Postman tool.",
        "Support pagination for large data sets.",
        "Add filtering capabilities in API queries.",
        "Use caching to improve API performance.",
        "Document APIs using Swagger."
      ]
    }
  ]
},
{
  id: 9,
  title: 'Software Engineer',
  image: require('../../assets/images/software.jpg'),
  salary:'₹6 – ₹12 LPA',
  keywordsToSearch: ['Java', 'C++', 'System Design', 'OOP'],
  about:'Software Engineers design, develop, test, and maintain software systems. They work across the tech stack, building web, mobile, desktop, and backend applications that solve real-world problems.',
  description: [
  "Design and implement software applications based on user requirements.",
  "Write clean, scalable, and efficient code using languages like Java, Python, or JavaScript.",
  "Collaborate with cross-functional teams including product managers and designers.",
  "Test and debug applications to ensure performance and reliability.",
  "Maintain documentation and version control using tools like Git.",
  "Optimize applications for speed, usability, and security.",
  "Contribute to agile development practices and code reviews."
],
  skills: [
    {
      skill: "Programming Languages",
      subskills: [
        "Proficient in Java for backend and enterprise applications.",
        "Skilled in C++ for performance-critical systems.",
        "Use Python for scripting and automation tasks.",
        "Develop applications using C# in .NET environments.",
        "Write client-side and server-side logic with JavaScript.",
        "Build scalable services with Go programming language.",
        "Utilize Ruby for rapid web application development.",
        "Leverage Rust for safe and concurrent systems programming."
      ]
    },
    {
      skill: "Object-Oriented Programming",
      subskills: [
        "Design and implement classes and objects to model real-world entities.",
        "Apply inheritance to promote code reuse and hierarchical relationships.",
        "Use polymorphism for flexible and dynamic method invocation.",
        "Encapsulate data and behavior to protect internal states.",
        "Abstract complex systems to simplify interaction interfaces.",
        "Employ common design patterns to solve recurring problems.",
        "Follow SOLID principles to write maintainable and scalable code.",
        "Create UML diagrams to visually represent system design."
      ]
    },
    {
      skill: "Data Structures & Algorithms",
      subskills: [
        "Implement arrays and manage indexed collections efficiently.",
        "Use linked lists for dynamic memory allocation and data management.",
        "Utilize stacks for LIFO data processing.",
        "Apply queues for FIFO order data handling.",
        "Build and traverse trees for hierarchical data representation.",
        "Leverage graphs for networked data structures and pathfinding.",
        "Use sorting algorithms to organize data efficiently.",
        "Apply searching algorithms to locate data quickly.",
        "Implement hashing techniques for fast data retrieval."
      ]
    },
    {
      skill: "System Design",
      subskills: [
        "Design scalable systems that can handle growing loads.",
        "Implement load balancing to distribute traffic evenly.",
        "Use caching strategies to reduce latency and improve performance.",
        "Apply database sharding for horizontal scaling of data stores.",
        "Develop microservices architecture for modular applications.",
        "Design APIs to expose system functionalities clearly.",
        "Build distributed systems that work reliably across multiple nodes.",
        "Understand CAP theorem to balance consistency, availability, and partition tolerance."
      ]
    },
    {
      skill: "Testing & Debugging",
      subskills: [
        "Write unit tests to verify individual components.",
        "Conduct integration tests to ensure components work together.",
        "Practice Test-Driven Development (TDD) for better code quality.",
        "Use debugging tools to identify and fix issues.",
        "Perform performance testing to optimize system efficiency.",
        "Employ mocking and stubbing for isolated testing.",
        "Participate in code reviews to maintain code standards.",
        "Use static code analysis to detect potential bugs early."
      ]
    },
    {
      skill: "Version Control & Collaboration",
      subskills: [
        "Use Git for version control and source code management.",
        "Apply branching strategies to manage feature development.",
        "Perform code merging to integrate changes from multiple contributors.",
        "Create and review pull requests for code quality assurance.",
        "Set up continuous integration pipelines for automated builds and tests.",
        "Maintain thorough code documentation for team communication.",
        "Follow Agile methodologies for iterative development.",
        "Use JIRA for issue tracking and project management."
      ]
    }
  ]
},
{
  id: 10,
  title: 'UI/UX Designer',
  image: require('../../assets/images/ui_ux.png'),
  salary:'₹5 – ₹10 LPA',
  keywordsToSearch: ['UI', 'UX', "UI/UX", 'Figma', 'Designer'],
  about:'UI/UX Designers focus on creating visually appealing, intuitive, and user-friendly digital interfaces. They balance functionality with aesthetics, ensuring a seamless experience across web and mobile platforms.',
  description: [
  "Conduct user research and usability testing to inform design decisions.",
  "Design wireframes, mockups, and prototypes using tools like Figma or Adobe XD.",
  "Create intuitive and visually appealing UI elements and interactions.",
  "Collaborate with developers to ensure accurate implementation of designs.",
  "Maintain consistent design language and style guides.",
  "Optimize user flows to enhance overall experience and reduce friction.",
  "Analyze user feedback and analytics to iterate on product designs."
],
  skills: [
    {
      skill: "User Research",
      subskills: [
        "Conduct user interviews to gather insights and understand needs.",
        "Design and distribute surveys for quantitative data collection.",
        "Create user personas to represent key audience segments.",
        "Map user journeys to visualize experience flow and pain points.",
        "Perform competitive analysis to identify market trends and opportunities.",
        "Facilitate usability testing to evaluate product effectiveness.",
        "Run A/B testing to compare design variations for performance.",
        "Review analytics data to inform design decisions."
      ]
    },
    {
      skill: "Wireframing & Prototyping",
      subskills: [
        "Develop low-fidelity wireframes to outline basic structure and layout.",
        "Create high-fidelity wireframes that incorporate detailed design elements.",
        "Build interactive prototypes for user testing and stakeholder reviews.",
        "Use tools like Figma, Sketch, and Adobe XD to design and prototype.",
        "Design clear user flows to guide navigation and interactions.",
        "Create clickable prototypes to simulate real user experience.",
        "Iterate designs based on testing feedback and user input.",
        "Integrate feedback to refine prototypes and enhance usability."
      ]
    },
    {
      skill: "Visual Design",
      subskills: [
        "Apply typography principles for readability and aesthetic appeal.",
        "Use color theory to evoke emotions and enhance interface clarity.",
        "Design iconography to aid navigation and convey meaning.",
        "Implement grid systems for balanced and consistent layouts.",
        "Develop layouts that optimize content hierarchy and user focus.",
        "Follow brand guidelines to maintain visual consistency.",
        "Create illustrations that complement UI elements.",
        "Ensure accessibility standards are met for inclusive design."
      ]
    },
    {
      skill: "Interaction Design",
      subskills: [
        "Design microinteractions to provide intuitive feedback.",
        "Incorporate animations to guide user attention and improve flow.",
        "Develop smooth transitions to enhance navigation experience.",
        "Create responsive designs for seamless use across devices.",
        "Design gestures that support natural and efficient interaction.",
        "Build design systems to standardize components and patterns.",
        "Maintain component libraries for reusable UI elements.",
        "Establish user feedback loops to continually improve the design."
      ]
    },
    {
      skill: "Design Tools & Software",
      subskills: [
        "Master Figma for collaborative interface design and prototyping.",
        "Use Adobe XD for designing and sharing interactive prototypes.",
        "Leverage Sketch for vector-based UI design.",
        "Utilize InVision to build and present clickable prototypes.",
        "Work with Zeplin to hand off design specs to developers.",
        "Edit images and graphics with Photoshop.",
        "Create vector illustrations in Illustrator.",
        "Animate UI components using Principle."
      ]
    },
    {
      skill: "Collaboration & Communication",
      subskills: [
        "Participate in design critiques to gather constructive feedback.",
        "Work closely with cross-functional teams including developers and product managers.",
        "Follow Agile processes for iterative and collaborative design.",
        "Deliver compelling presentations to stakeholders.",
        "Communicate design rationale effectively to non-designers.",
        "Document design decisions and workflows clearly.",
        "Use version control tools to manage design iterations.",
        "Analyze user feedback to guide future design improvements."
      ]
    }
  ]
}
]

export default jobsData;


