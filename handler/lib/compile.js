const request = require('request');

var compilers = {
    'c': 'gcc-head-c',
    'cpp': 'gcc-head',
    'c#': 'dotnetcore-head',
    'rill': 'rill-head',
    'erlang': 'erlang-head',
    'elixir': 'elixir-head',
    'haskell': 'ghc-head',
    'd': 'dmd-head',
    'java': 'openjdk-head',
    'rust': 'rust-head',
    'python': 'cpython-head',
    'python2.7': 'cpython-2.7-head',
    'ruby': 'ruby-head',
    'scala': 'scala-2.13.x',
    'groovy': 'groovy-3.0.7',
    'nodejs': 'nodejs-head',
    'nodejs14': 'nodejs-14.0.0',
    'coffeescript': 'coffeescript-head',
    'spidermonkey': 'spidermonkey-45.0.2',
    'swift': 'swift-head',
    'perl': 'perl-head',
    'php': 'php-head',
    'lua': 'lua-5.4.0',
    'sql': 'sqlite-head',
    'pascal': 'fpc-head',
    'lisp': 'clisp-2.49',
    'lazyk': 'lazyk',
    'vim': 'vim-head',
    'pypy': 'pypy-head',
    'ocaml': 'ocaml-head',
    'go': 'go-head',
    'bash': 'bash',
    'pony': 'pony-head',
    'crystal': 'crystal-head',
    'nim': 'nim-head',
    'openssl': 'openssl-head',
    'f#': 'fsharp-head',
    'r': 'r-head',
    'typescript': 'typescript-3.9.5',
    'julia': 'julia-head'
}

const options = {
    method: 'POST',
    url: 'https://wandbox.org/api/compile.json',
    json: true,
    timeout: 10000,
    headers: { 'content-type': 'application/json' }
}

const compile = (lang, code) => new Promise((resolve, reject) => {
    if (!compilers.hasOwnProperty(lang)) return resolve('📛 Wrong compiler used, please see \'!help compile\' for a list of available compilers.');
    else if (!code) { return resolve('😶 Why did you send an empty code? 😒') }

    let compiler = compilers[lang];
    code = code.replace(/[‘’]/g, '\'').replace(/[“”]/g, '\"');
    options.body = {
        code: code,
        compiler: compiler
    }
    request(options, (error, response, body) => {
        if (error) {
            console.error('Request has failed!\nReason:', error);
            return resolve('🌐 Server error has occurred!, this has nothing to do with me...');
        }
        if (body.compiler_error) { resolve(body.compiler_error) }
        else if (body.program_error) { resolve(body.program_error) }
        else if (!body.program_message) { resolve('😶 The output was empty, so here\'s a unicorn 🦄') }
        else { resolve(body.program_message) }
    });
});



module.exports = {
    compile
}