/*
Copyright HCL Technologies Ltd. 2001, 2020
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

var events = require( "events" ),
	helper = require( "./helper" ),
	server = require( "./server" ),
	sync = helper.getSyncModule();

// SETUP
// changed locally and remotely: read me.txt
// changed locally and remotely: profiles/profile_deferred.json
// deleted locally and changed remotely: contributions/schema/JSON Module Contribution Schema v1.8.json
// changed locally and deleted remotey: css/deeper/blue/blue.css.uncompressed.css

describe( "sync-conflicts-push", function() {
	this.timeout( 10000 );

	describe( "sync-conflict-push", function() {
		var hook, webDavServer, syncPoint;
		beforeEach( function( done ) {
			hook = helper.captureStream( process.stdout );
			syncPoint = helper.createSyncPointWithContent( "local-sync-conflict", function() {
				server.startServerWithContent( "server-sync-conflict", function( s ) {
					webDavServer = s;
					done();
				} );
			} );
		} );
		afterEach( function( done ) {
			server.closeServer( webDavServer, function() {
				hook.unhook();
				helper.cleanupSyncPoint( done );
			} );
		} );

		it( "Should recognize new conflicts [PUSH]", function( done ) {

			//sync.setLoggerConfig( null, { debug: true, finest: true }, null );

			var emitter = new events.EventEmitter();
			emitter.on( "status", function( name, param ) {

				//console.log( name, param );
				if ( name == "sync" && param == "complete" ) {

					// this indirection is need to call done in success and failure cases
					helper.asyncCheck( done, function() {
						hook.captured().should.containEql( "Uploading updated files..." );
						hook.captured().should.containEql( "File upload complete: read me.txt" );
						hook.captured().should.containEql( "File upload complete: profiles/profile_deferred.json" );
						hook.captured().should.containEql( "File deletion complete: contributions/schema/JSON Module Contribution Schema v1.8.json" );
						hook.captured().should.containEql( "File upload complete: css/deeper/blue/blue.css.uncompressed.css" );
						hook.captured().should.containEql( "Synchronization complete." );

						helper.assertSyncReport( hook.captured(), {
							total: 23,
							uploaded: 3,
							downloaded: 0,
							deletedLocale: 0,
							deletedRemote: 1,
							conflicts: 0,
							conflictsResolved: 0,
							noaction: 19,
							errors: 0
						} );
					} );
				}

			} );
			sync.runSync( syncPoint, {
				mode: "push",
				autoWatch: false,
				backgroundSync: false
			}, emitter );

		} )

	} )

	describe( "sync-conflict-recognized-push", function() {
		var hook, webDavServer, syncPoint;
		beforeEach( function( done ) {
			hook = helper.captureStream( process.stdout );
			syncPoint = helper.createSyncPointWithContent( "local-sync-conflict-recognized", function() {
				server.startServerWithContent( "server-sync-conflict-recognized", function( s ) {
					webDavServer = s;
					done();
				} );
			} );
		} );
		afterEach( function( done ) {
			server.closeServer( webDavServer, function() {
				hook.unhook();
				helper.cleanupSyncPoint( done );
			} );
		} );

		it( "Should recognize existing conflicts [PUSH]", function( done ) {

			//sync.setLoggerConfig( null, { debug: true, finest: true }, null );

			var emitter = new events.EventEmitter();
			emitter.on( "status", function( name, param ) {

				//console.log( name, param );
				if ( name == "sync" && param == "complete" ) {

					// this indirection is need to call done in success and failure cases
					helper.asyncCheck( done, function() {

						hook.captured().should.containEql( "Uploading updated files..." );
						hook.captured().should.containEql( "File upload complete: read me.txt" );
						hook.captured().should.containEql( "File upload complete: profiles/profile_deferred.json" );
						hook.captured().should.containEql( "File deletion complete: contributions/schema/JSON Module Contribution Schema v1.8.json" );
						hook.captured().should.containEql( "File upload complete: css/deeper/blue/blue.css.uncompressed.css" );
						hook.captured().should.containEql( "Synchronization complete." );

						helper.assertSyncReport( hook.captured(), {
							total: 23,
							uploaded: 3,
							downloaded: 0,
							deletedLocale: 0,
							deletedRemote: 1,
							conflicts: 0,
							conflictsResolved: 0,
							noaction: 19,
							errors: 0
						} );
					} );
				}

			} );
			sync.runSync( syncPoint, {
				mode: "push",
				autoWatch: false,
				backgroundSync: false
			}, emitter );

		} )

	} )

} )
