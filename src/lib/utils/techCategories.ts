// Comprehensive technology categorization database
const techCategories = {
	Frontend: [
		// Core Web Technologies
		'html', 'html5', 'css', 'css3', 'javascript', 'typescript', 'jsx', 'tsx',
		
		// Frameworks & Libraries
		'react', 'vue', 'vue.js', 'angular', 'svelte', 'solid', 'lit', 'stencil',
		'alpine.js', 'alpinejs', 'htmx', 'stimulus', 'turbo', 'ember', 'backbone',
		'knockout', 'mithril', 'riot', 'polymer', 'web components',
		
		// React Ecosystem
		'next.js', 'nextjs', 'gatsby', 'remix', 'create-react-app', 'vite',
		'react router', 'redux', 'mobx', 'recoil', 'zustand', 'react query',
		'swr', 'react hook form', 'formik', 'styled-components', 'emotion',
		
		// Vue Ecosystem
		'nuxt.js', 'nuxt', 'vuex', 'pinia', 'vue router', 'quasar', 'vuetify',
		'element ui', 'ant design vue', 'vuepress', 'gridsome',
		
		// Build Tools & Bundlers
		'webpack', 'vite', 'parcel', 'rollup', 'esbuild', 'swc', 'turbopack',
		'snowpack', 'gulp', 'grunt', 'browserify', 'fusebox',
		
		// CSS Frameworks & Preprocessors
		'bootstrap', 'tailwind', 'tailwindcss', 'bulma', 'foundation', 'materialize',
		'semantic ui', 'ant design', 'material ui', 'mui', 'chakra ui', 'mantine',
		'sass', 'scss', 'less', 'stylus', 'postcss', 'styled-jsx',
		
		// UI Libraries
		'jquery', 'lodash', 'underscore', 'moment', 'dayjs', 'date-fns',
		'chart.js', 'chartjs', 'd3', 'd3.js', 'three.js', 'threejs', 'p5.js',
		'gsap', 'anime.js', 'lottie', 'framer motion', 'react spring',
		
		// Testing
		'jest', 'vitest', 'cypress', 'playwright', 'puppeteer', 'selenium',
		'testing library', '@testing-library', 'enzyme', 'karma', 'jasmine',
		
		// Design Tools
		'figma', 'sketch', 'adobe xd', 'invision', 'zeplin', 'abstract',
		'framer', 'principle', 'protopie', 'marvel', 'balsamiq'
	],

	Backend: [
		// JavaScript/Node.js
		'node.js', 'nodejs', 'express', 'express.js', 'fastify', 'koa', 'koa.js',
		'hapi', 'nestjs', 'adonis', 'meteor', 'sails', 'feathers', 'loopback',
		'deno', 'bun', 'npm', 'yarn', 'pnpm',
		
		// Python
		'python', 'django', 'flask', 'fastapi', 'tornado', 'pyramid', 'bottle',
		'falcon', 'sanic', 'starlette', 'celery', 'gunicorn', 'uwsgi', 'pipenv',
		'poetry', 'conda', 'pip', 'virtualenv',
		
		// Java Ecosystem
		'java', 'spring', 'spring boot', 'spring mvc', 'spring security',
		'hibernate', 'mybatis', 'struts', 'jsf', 'maven', 'gradle', 'ant',
		'tomcat', 'jetty', 'wildfly', 'jboss', 'weblogic', 'websphere',
		
		// .NET Ecosystem
		'c#', 'csharp', '.net', 'asp.net', 'asp.net core', '.net core', '.net 5',
		'.net 6', '.net 7', '.net 8', 'entity framework', 'blazor', 'xamarin',
		'unity', 'nuget', 'msbuild', 'visual studio', 'vs code',
		
		// PHP
		'php', 'laravel', 'symfony', 'codeigniter', 'zend', 'cakephp', 'yii',
		'phalcon', 'slim', 'lumen', 'composer', 'phpunit', 'wordpress', 'drupal',
		'joomla', 'magento', 'prestashop',
		
		// Ruby
		'ruby', 'rails', 'ruby on rails', 'sinatra', 'hanami', 'roda', 'grape',
		'padrino', 'bundler', 'gem', 'rspec', 'minitest', 'capybara',
		
		// Go
		'go', 'golang', 'gin', 'echo', 'fiber', 'beego', 'revel', 'chi',
		'gorilla', 'buffalo', 'iris', 'martini',
		
		// Rust
		'rust', 'actix', 'actix-web', 'axum', 'warp', 'rocket', 'tide', 'hyper',
		'tokio', 'serde', 'diesel', 'cargo',
		
		// Other Languages
		'kotlin', 'scala', 'clojure', 'elixir', 'phoenix', 'erlang', 'haskell',
		'perl', 'lua', 'crystal', 'nim', 'zig', 'dart', 'julia', 'r',
		
		// Web Servers
		'nginx', 'apache', 'iis', 'caddy', 'lighttpd', 'traefik', 'envoy',
		'haproxy', 'cloudflare', 'fastly', 'varnish'
	],

	Database: [
		// Relational Databases
		'mysql', 'postgresql', 'postgres', 'sqlite', 'mariadb', 'oracle',
		'sql server', 'db2', 'sybase', 'firebird', 'h2', 'derby', 'hsqldb',
		
		// NoSQL Databases
		'mongodb', 'redis', 'cassandra', 'couchdb', 'dynamodb', 'elasticsearch',
		'neo4j', 'arangodb', 'orientdb', 'rethinkdb', 'couchbase', 'amazon dynamodb',
		'azure cosmos db', 'google firestore', 'fauna', 'dgraph', 'tigergraph',
		
		// Time Series & Analytics
		'influxdb', 'timescaledb', 'prometheus', 'grafana', 'clickhouse',
		'apache druid', 'pinot', 'rockset', 'questdb', 'kdb+',
		
		// Cloud Databases
		'amazon rds', 'google cloud sql', 'azure sql', 'planetscale', 'supabase',
		'firebase', 'aws aurora', 'cockroachdb', 'yugabytedb', 'tidb',
		'google bigtable', 'amazon redshift', 'snowflake', 'databricks',
		'bigquery', 'amazon athena', 'presto', 'trino', 'apache spark',
		
		// ORMs & Query Builders
		'prisma', 'drizzle', 'typeorm', 'sequelize', 'knex', 'objection',
		'mongoose', 'eloquent', 'active record', 'hibernate', 'mybatis',
		'entity framework', 'dapper', 'sqlalchemy', 'django orm', 'peewee',
		'tortoise orm', 'gorm', 'diesel', 'sea-orm',
		
		// Data Processing
		'apache kafka', 'apache pulsar', 'rabbitmq', 'activemq', 'nats',
		'apache airflow', 'luigi', 'prefect', 'dagster', 'dbt', 'apache beam',
		'apache flink', 'apache storm', 'apache samza'
	],

	DevOps: [
		// Cloud Platforms
		'aws', 'amazon web services', 'gcp', 'google cloud', 'azure', 'microsoft azure',
		'digitalocean', 'linode', 'vultr', 'hetzner', 'ovh', 'scaleway',
		'oracle cloud', 'ibm cloud', 'alibaba cloud', 'tencent cloud',
		
		// Containerization
		'docker', 'podman', 'containerd', 'cri-o', 'buildah', 'skopeo',
		'docker compose', 'docker swarm', 'portainer', 'rancher',
		
		// Orchestration
		'kubernetes', 'k8s', 'openshift', 'nomad', 'docker swarm', 'mesos',
		'helm', 'kustomize', 'skaffold', 'tilt', 'octant', 'lens',
		
		// Infrastructure as Code
		'terraform', 'terragrunt', 'pulumi', 'cloudformation', 'aws cdk',
		'ansible', 'chef', 'puppet', 'saltstack', 'vagrant', 'packer',
		
		// CI/CD
		'jenkins', 'github actions', 'gitlab ci', 'azure devops', 'circleci',
		'travis ci', 'teamcity', 'bamboo', 'buildkite', 'drone', 'argo cd',
		'flux', 'tekton', 'spinnaker', 'gocd', 'concourse',
		
		// Monitoring & Observability
		'prometheus', 'grafana', 'datadog', 'new relic', 'dynatrace', 'splunk',
		'elk stack', 'elastic', 'logstash', 'kibana', 'beats', 'fluentd',
		'jaeger', 'zipkin', 'opentelemetry', 'sentry', 'bugsnag', 'rollbar',
		
		// Service Mesh
		'istio', 'linkerd', 'consul connect', 'envoy', 'traefik mesh',
		'kuma', 'open service mesh', 'cilium',
		
		// Deployment Platforms
		'vercel', 'netlify', 'heroku', 'railway', 'fly.io', 'render',
		'surge', 'github pages', 'cloudflare pages', 'aws amplify',
		'firebase hosting', 'azure static web apps'
	],

	Mobile: [
		// Cross-Platform
		'react native', 'flutter', 'ionic', 'cordova', 'phonegap', 'xamarin',
		'expo', 'capacitor', 'nativescript', 'quasar', 'framework7',
		'onsen ui', 'mobile angular ui', 'intel xdk',
		
		// Native iOS
		'swift', 'objective-c', 'xcode', 'cocoapods', 'carthage', 'swift package manager',
		'core data', 'realm', 'alamofire', 'rxswift', 'snapkit',
		
		// Native Android
		'kotlin', 'java', 'android studio', 'gradle', 'jetpack compose',
		'room', 'retrofit', 'okhttp', 'dagger', 'hilt', 'rxjava',
		
		// Game Development
		'unity', 'unreal engine', 'godot', 'defold', 'cocos2d', 'libgdx',
		'corona sdk', 'solar2d', 'construct 3', 'gamemaker studio',
		
		// Testing
		'appium', 'detox', 'xcuitest', 'espresso', 'ui automator',
		'firebase test lab', 'aws device farm', 'browserstack app testing'
	],

	'AI/ML': [
		// Machine Learning Frameworks
		'tensorflow', 'pytorch', 'jax', 'sklearn', 'scikit-learn', 'xgboost',
		'lightgbm', 'catboost', 'keras', 'fastai', 'paddle', 'mxnet',
		'caffe', 'theano', 'torch', 'cntk',
		
		// Data Science
		'pandas', 'numpy', 'scipy', 'matplotlib', 'seaborn', 'plotly',
		'bokeh', 'altair', 'jupyter', 'jupyterlab', 'colab', 'kaggle',
		'anaconda', 'conda', 'spyder', 'rstudio',
		
		// NLP & Language Models
		'hugging face', 'transformers', 'spacy', 'nltk', 'gensim', 'bert',
		'gpt', 'openai', 'anthropic', 'cohere', 'langchain', 'llamaindex',
		'haystack', 'rasa', 'dialogflow', 'wit.ai', 'luis',
		
		// Computer Vision
		'opencv', 'pillow', 'imageio', 'albumentations', 'detectron2',
		'yolo', 'faster r-cnn', 'mask r-cnn', 'mediapipe', 'dlib',
		
		// MLOps & Deployment
		'mlflow', 'kubeflow', 'airflow', 'prefect', 'wandb', 'neptune',
		'comet', 'dvc', 'cml', 'feast', 'great expectations', 'evidently',
		'seldon', 'bentoml', 'ray', 'dask', 'spark mllib',
		
		// Vector Databases
		'pinecone', 'weaviate', 'qdrant', 'milvus', 'chroma', 'chromadb',
		'faiss', 'annoy', 'nmslib', 'elasticsearch vector',
		
		// Auto ML
		'automl', 'auto-sklearn', 'tpot', 'h2o.ai', 'datarobot', 'azure automl',
		'google automl', 'aws sagemaker autopilot'
	],

	Testing: [
		// Frontend Testing
		'jest', 'vitest', 'mocha', 'jasmine', 'karma', 'cypress', 'playwright',
		'puppeteer', 'selenium', 'webdriver', 'testing library', 'enzyme',
		'storybook', 'chromatic', 'percy', 'applitools', 'browserstack',
		
		// Backend Testing
		'postman', 'insomnia', 'newman', 'supertest', 'chai', 'sinon',
		'nock', 'wiremock', 'mockito', 'junit', 'testng', 'cucumber',
		'gherkin', 'behave', 'rspec', 'minitest', 'pytest', 'unittest',
		
		// Load Testing
		'jmeter', 'k6', 'artillery', 'locust', 'wrk', 'ab', 'siege',
		'gatling', 'blazemeter', 'loader.io',
		
		// API Testing
		'rest assured', 'karate', 'tavern', 'dredd', 'api blueprint',
		'swagger', 'openapi', 'graphql playground', 'apollo studio'
	],

	Security: [
		// Security Tools
		'owasp', 'burp suite', 'wireshark', 'nmap', 'metasploit', 'kali linux',
		'nessus', 'qualys', 'veracode', 'checkmarx', 'sonarqube', 'snyk',
		'whitesource', 'black duck', 'dependabot', 'renovate',
		
		// Authentication & Authorization
		'auth0', 'okta', 'firebase auth', 'aws cognito', 'azure ad', 'keycloak',
		'oauth', 'saml', 'jwt', 'passport', 'spring security', 'helmet',
		
		// Encryption & PKI
		'openssl', 'let\'s encrypt', 'vault', 'aws kms', 'azure key vault',
		'google kms', 'pgp', 'gpg', 'tls', 'ssl'
	],

	Desktop: [
		// Cross-Platform
		'electron', 'tauri', 'flutter desktop', 'qt', 'gtk', 'wxwidgets',
		'fyne', 'wails', 'neutralino', 'nwjs', 'cordova desktop',
		
		// Platform Specific
		'wpf', 'winforms', 'uwp', 'win32', 'cocoa', 'appkit', 'swiftui',
		'tkinter', 'pyqt', 'kivy', 'javafx', 'swing', 'awt'
	],

	Blockchain: [
		// Platforms
		'ethereum', 'bitcoin', 'solana', 'polygon', 'avalanche', 'cardano',
		'polkadot', 'chainlink', 'binance smart chain', 'cosmos', 'tezos',
		'algorand', 'near', 'flow', 'aptos', 'sui',
		
		// Development
		'solidity', 'rust', 'move', 'vyper', 'hardhat', 'truffle', 'foundry',
		'remix', 'ganache', 'web3.js', 'ethers.js', 'metamask', 'walletconnect',
		
		// Tokens & Standards
		'erc-20', 'erc-721', 'erc-1155', 'nft', 'defi', 'dao', 'smart contracts'
	],

	Analytics: [
		// Web Analytics
		'google analytics', 'adobe analytics', 'mixpanel', 'amplitude', 'segment',
		'hotjar', 'fullstory', 'logrocket', 'heap', 'kissmetrics', 'matomo',
		
		// Business Intelligence
		'tableau', 'power bi', 'looker', 'qlik', 'sisense', 'domo', 'chartio',
		'metabase', 'apache superset', 'grafana', 'kibana',
		
		// Data Processing
		'apache spark', 'hadoop', 'hive', 'pig', 'storm', 'flink', 'kafka',
		'nifi', 'talend', 'pentaho', 'informatica', 'fivetran', 'stitch'
	],

	CMS: [
		// Traditional CMS
		'wordpress', 'drupal', 'joomla', 'typo3', 'concrete5', 'modx',
		'umbraco', 'episerver', 'sitecore', 'adobe experience manager',
		
		// Headless CMS
		'strapi', 'contentful', 'sanity', 'ghost', 'keystonejs', 'payload',
		'directus', 'forestry', 'netlify cms', 'tina', 'builder.io',
		
		// E-commerce
		'shopify', 'woocommerce', 'magento', 'prestashop', 'opencart',
		'bigcommerce', 'squarespace', 'wix', 'webflow'
	],

	Gaming: [
		// Game Engines
		'unity', 'unreal engine', 'godot', 'construct 3', 'gamemaker studio',
		'defold', 'cocos2d', 'love2d', 'phaser', 'babylonjs', 'three.js',
		'pixijs', 'matter.js', 'cannon.js', 'ammo.js',
		
		// Languages & Frameworks
		'c++', 'c#', 'gdscript', 'lua', 'python', 'javascript', 'haxe',
		'actionscript', 'hlsl', 'glsl', 'opengl', 'vulkan', 'directx',
		
		// Tools
		'blender', 'maya', '3ds max', 'substance painter', 'photoshop',
		'aseprite', 'spine', 'tiled', 'unity analytics', 'gameanalytics'
	]
};

export function categorizeTechnology(techName: string): string {
	const normalizedName = techName.toLowerCase().trim();
	
	// Direct match in categories
	for (const [category, technologies] of Object.entries(techCategories)) {
		if (technologies.some(tech => 
			normalizedName === tech || 
			normalizedName.includes(tech) || 
			tech.includes(normalizedName)
		)) {
			return category;
		}
	}
	
	// Enhanced fuzzy matching for common patterns
	
	// Frontend patterns
	if (normalizedName.match(/(\.js|javascript|typescript|html|css|react|vue|angular|frontend|ui|ux)/)) {
		return 'Frontend';
	}
	
	// Backend patterns
	if (normalizedName.match(/(server|backend|api|microservice|service|endpoint|rest|graphql)/)) {
		return 'Backend';
	}
	
	// Database patterns
	if (normalizedName.match(/(db|database|sql|nosql|query|orm|migration|schema)/)) {
		return 'Database';
	}
	
	// DevOps patterns
	if (normalizedName.match(/(deploy|deployment|cloud|aws|gcp|azure|devops|ci\/cd|pipeline|infra)/)) {
		return 'DevOps';
	}
	
	// Mobile patterns
	if (normalizedName.match(/(mobile|app|ios|android|native|cross.platform|hybrid)/)) {
		return 'Mobile';
	}
	
	// AI/ML patterns
	if (normalizedName.match(/(ai|ml|machine.learning|neural|deep.learning|nlp|computer.vision|data.science)/)) {
		return 'AI/ML';
	}
	
	// Testing patterns
	if (normalizedName.match(/(test|testing|spec|unit|integration|e2e|automation|qa)/)) {
		return 'Testing';
	}
	
	// Security patterns
	if (normalizedName.match(/(security|auth|oauth|jwt|encryption|ssl|tls|firewall|vulnerability)/)) {
		return 'Security';
	}
	
	// Desktop patterns
	if (normalizedName.match(/(desktop|electron|native|gui|window|cross.platform.desktop)/)) {
		return 'Desktop';
	}
	
	// Blockchain patterns
	if (normalizedName.match(/(blockchain|crypto|ethereum|bitcoin|solidity|web3|defi|nft|smart.contract)/)) {
		return 'Blockchain';
	}
	
	// Analytics patterns
	if (normalizedName.match(/(analytics|tracking|metrics|dashboard|bi|business.intelligence|visualization)/)) {
		return 'Analytics';
	}
	
	// CMS patterns
	if (normalizedName.match(/(cms|content.management|headless|wordpress|drupal|blog|website.builder)/)) {
		return 'CMS';
	}
	
	// Gaming patterns
	if (normalizedName.match(/(game|gaming|unity|unreal|engine|3d|graphics|rendering|shader)/)) {
		return 'Gaming';
	}
	
	// Default to Other if no match found
	return 'Other';
} 