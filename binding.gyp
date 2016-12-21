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
				"blake2_code_20161221/sse/blake2b.c",
				"blake2_code_20161221/sse/blake2bp.c",
				"blake2_code_20161221/sse/blake2s.c",
				"blake2_code_20161221/sse/blake2sp.c"
			],
			"include_dirs":
			[
				"blake2_code_20161221/sse/",
				"<!(node -e \"require('nan')\")"
			],
			'xcode_settings': {
              'GCC_ENABLE_CPP_RTTI': 'YES',
              'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
              'MACOSX_DEPLOYMENT_TARGET':'10.8',
              'CLANG_CXX_LIBRARY': 'libc++',
              'CLANG_CXX_LANGUAGE_STANDARD':'c++11',
              'GCC_VERSION': 'com.apple.compilers.llvm.clang.1_0'
            },
			"cflags": ["-std=c99"]
		}
	]
}
