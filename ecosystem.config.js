module.exports = {
  apps: [{
    name: "the_multitasker",
    script: "./index.js",
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    error_file: "./logs/pm2/err.log",
    out_file: "./logs/pm2/out.log",
    log: "./logs/pm2/out_err.log",
    // restart service every day once at 2:30
    cron_restart: "30 2 * * *",
    max_memory_restart: "2G"
  }]
}
