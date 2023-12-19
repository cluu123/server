module.exports = {
    apps: [
        {
            name: 'tot-socket-server',
            script: './bin/www',
            error_file: './log/err.log',
            out_file: './log/out.log',
            merge_logs: true,
            log_date_format: '【YYYY-MM-DD HH:mm】',
            // "instances": 3,
            // "exec_mode": "cluster",
            env: {
                NODE_ENV: 'production',
                // HOST: 'localhost',
                PORT: 5570
            }
        }
    ]
};
