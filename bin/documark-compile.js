#!/usr/bin/env node

/* jslint node: true */

'use strict';

var program = require( 'commander' );

program
	.option( '-v, --verbose', 'increase verbosity', function( v, total ) { return total + 1; }, 0 )
	.option( '-w, --watch', 'automatically recompile on file change' )
	.option( '-t, --throttle [milliseconds]', 'throttle recompile watcher', 1000 )
	.parse( process.argv )
	;

var basePath = program.args.length ? program.args[ program.args.length - 1 ] : '.';
var Documark = require( '../lib/documark' );
var doc      = new Documark( basePath );
var chalk    = require( 'chalk' );

doc.setVerbosity( program.verbose );

function compile() {
	process.stdout.write( 'Compiling.. ' );
	try {
		doc.load();
		doc.compile();
		console.log( chalk.green( 'Done.' ) );
	}
	catch( e ) {
		console.log( chalk.red( 'Error!' ) );
		console.error( e );
	}
}

compile();

if( program.watch ) {
	var monocle  = require( 'monocle' )();
	var throttle = require( 'throttleit' );

	monocle.watchDirectory( {
		root: doc.getPath(),
		fileFilter: [ '!**/*.pdf' ],
		listener: throttle( compile, program.throttle )
	} );
}
