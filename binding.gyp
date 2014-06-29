{
	"targets":
	[
		{
			"target_name": "blake2",
			"sources":
			[
				"src/blake2.cpp",
				"src/sumbuffer.cpp",
				"blake2_code_20140114/b2sum/b2sum.c",
				"blake2_code_20140114/sse/blake2b.c",
				"blake2_code_20140114/sse/blake2bp.c",
				"blake2_code_20140114/sse/blake2s.c",
				"blake2_code_20140114/sse/blake2sp.c"
			],
			"include_dirs":
			[
				"blake2_code_20140114/sse/",
				"<!(node -e \"require('nan')\")"
			],
			"cflags": ["-std=c99"]
		}
	]
}
