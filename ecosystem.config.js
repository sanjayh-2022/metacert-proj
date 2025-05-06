// PM2 Configuration - Optimized for AWS Free Tier t2.micro (1GB RAM)
module.exports = {
  apps: [
    {
      name: 'metacert-nextjs',
      script: 'npm',
      args: 'start',
      cwd: '/app',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NODE_OPTIONS: '--max-old-space-size=300' // Limit to 300MB for Next.js
      },
      instances: 1, // Single instance for t2.micro
      exec_mode: 'fork', // Fork mode uses less memory than cluster
      watch: false,
      max_memory_restart: '400M', // Restart if memory exceeds 400MB
      error_file: '/app/logs/nextjs-error.log',
      out_file: '/app/logs/nextjs-out.log',
      log_file: '/app/logs/nextjs-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'metacert-express',
      script: 'app.js',
      cwd: '/app',
      env: {
        NODE_ENV: 'production',
        PORT: 8080,
        NODE_OPTIONS: '--max-old-space-size=200' // Limit to 200MB for Express
      },
      instances: 1, // Single instance for t2.micro
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '300M', // Restart if memory exceeds 300MB
      error_file: '/app/logs/express-error.log',
      out_file: '/app/logs/express-out.log',
      log_file: '/app/logs/express-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};