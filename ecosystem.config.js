module.exports = {
  apps: [{
    name: "the-multitasker",
    script: "./index.js",
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    error_file: "./logs/pm2/err.log",
    out_file: "./logs/pm2/out.log",
    log: "./logs/pm2/out_err.log",
    cron_restart: "0 * * * *",
    max_memory_restart: "500M"
  }]
}
