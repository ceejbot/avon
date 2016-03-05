{
	"targets":
	[
		{
			"target_name": "blake2",
			"sources":
			[
				"src/avon.cc",
				"src/buffers.c",
				"src/streamer.cc",
				"src/b2sum.c",
				"blake2_code_20160305/sse/blake2b.c",
				"blake2_code_20160305/sse/blake2bp.c",
				"blake2_code_20160305/sse/blake2s.c",
				"blake2_code_20160305/sse/blake2sp.c"
			],
			"include_dirs":
			[
				"blake2_code_20160305/sse/",
				"<!(node -e \"require('nan')\")"
			],
			"cflags": ["-std=c99"]
		}
	]
}
