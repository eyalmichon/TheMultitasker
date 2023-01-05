const { fetchJson } = require('../util/fetcher');

var compilers = {
    'c': 'gcc-head-c',
    'cpp': 'gcc-head',
    'c#': 'dotnetcore-head',
    'erlang': 'erlang-23.3.1',
    'elixir': 'elixir-1.11.4',
    'haskell': 'ghc-9.0.1',
    'd': 'dmd-2.096.0',
    'java': 'openjdk-jdk-15.0.3+2',
    'rust': 'rust-1.51.0',
    'python': 'cpython-3.10.2',
    'python2.7': 'cpython-2.7.18',
    'ruby': 'ruby-3.1.0',
    'scala': 'scala-2.13.5',
    'groovy': 'groovy-3.0.8',
    'nodejs': 'nodejs-16.14.0',
    'nodejs14': 'nodejs-14.16.1',
    'spidermonkey': 'spidermonkey-88.0.0',
    'swift': 'swift-5.3.3',
    'perl': 'perl-5.34.0',
    'php': 'php-8.0.3',
    'lua': 'lua-5.4.3',
    'sql': 'sqlite-3.35.5',
    'pascal': 'fpc-3.2.0',
    'lisp': 'clisp-2.49',
    'lazyk': 'lazyk',
    'vim': 'vim-8.2.2811',
    'pypy': 'pypy-3.7-v7.3.4',
    'ocaml': 'ocaml-4.12.0',
    'go': 'go-1.16.3',
    'bash': 'bash',
    'pony': 'pony-0.39.1',
    'crystal': 'crystal-1.0.0',
    'nim': 'nim-1.6.10',
    'openssl': 'openssl-1.1.1k',
    'r': 'r-4.0.5',
    'typescript': 'typescript-4.2.4',
    'julia': 'julia-1.6.1'
}


const compile = (lang, code) =>
    new Promise((resolve, reject) => {
        if (!compilers.hasOwnProperty(lang))
            return resolve(
                "📛 Wrong compiler used, please see '!help compile' for a list of available compilers."
            );
        else if (!code) {
            return resolve("😶 Why did you send an empty code? 😒");
        }

        let compiler = compilers[lang];
        code = code.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');

        fetchJson("https://wandbox.org/api/compile.json", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                code: code,
                compiler: compiler,
            }),
        })
            .then((body) => {
                console.log(body);
                if (body.compiler_error) {
                    resolve(body.compiler_error);
                } else if (body.program_error) {
                    resolve(body.program_error);
                } else if (!body.program_message) {
                    resolve("😶 The output was empty, so here's a unicorn 🦄");
                } else {
                    resolve(body.program_message);
                }
            })
            .catch((error) => {
                console.error("Request has failed!\nReason:", error);
                return resolve(
                    "🌐 Server error has occurred!, this has nothing to do with me..."
                );
            });
    });



module.exports = {
    compile
}