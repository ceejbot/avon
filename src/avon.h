#ifndef AVON_H
#define AVON_H

#ifdef __cplusplus
extern "C"
{
    enum algorithms_t { B, BP, S, SP };

    typedef int (*blake2fn)(FILE *, void *, size_t outbytes);
    typedef int (*blake2update)(void *, const uint8_t *in, uint64_t inlen);

    int blake2b_stream(FILE *stream, void *resstream, size_t outbytes);
    int blake2bp_stream(FILE *stream, void *resstream, size_t outbytes);
    int blake2s_stream(FILE *stream, void *resstream, size_t outbytes);
    int blake2sp_stream(FILE *stream, void *resstream, size_t outbytes);

    typedef int (*blake2bufferfn)(const void *, size_t, void *);

    int blake2b_buffer(const void *buffer, size_t buflen, void *resstream);
    int blake2bp_buffer(const void *buffer, size_t buflen, void *resstream);
    int blake2s_buffer(const void *buffer, size_t buflen, void *resstream);
    int blake2sp_buffer(const void *buffer, size_t buflen, void *resstream);
}

#endif
#endif
