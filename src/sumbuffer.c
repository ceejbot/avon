#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include <errno.h>

#include <ctype.h>
#include <unistd.h>
#include <getopt.h>

#include "blake2.h"

int blake2s_buffer(const void *buffer, size_t length, void *resstream)
{
	int ret = -1;
	blake2s_state S[1];

	blake2s_init(S, BLAKE2S_OUTBYTES);
	blake2s_update(S, buffer, length);
	blake2s_final(S, resstream, BLAKE2S_OUTBYTES);
	ret = 0;

	return ret;
}

int blake2b_buffer(const void *buffer, size_t length, void *resstream)
{
	int ret = -1;
	blake2b_state S[1];

	blake2b_init(S, BLAKE2B_OUTBYTES);
	blake2b_update(S, buffer, length);
	blake2b_final(S, resstream, BLAKE2B_OUTBYTES);
	ret = 0;

	return ret;
}


int blake2sp_buffer(const void *buffer, size_t length, void *resstream)
{
	int ret = -1;
	blake2sp_state S[1];

	blake2sp_init(S, BLAKE2S_OUTBYTES);
	blake2sp_update(S, buffer, length);
	blake2sp_final(S, resstream, BLAKE2S_OUTBYTES);
	ret = 0;

	return ret;
}

int blake2bp_buffer(const void *buffer, size_t length, void *resstream)
{
	int ret = -1;
	blake2bp_state S[1];

	blake2bp_init(S, BLAKE2B_OUTBYTES);
	blake2bp_update(S, buffer, length);
	blake2bp_final(S, resstream, BLAKE2B_OUTBYTES);
	ret = 0;

	return ret;
}
