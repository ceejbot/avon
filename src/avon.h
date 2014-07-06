#ifdef __cplusplus
extern "C"
{
    enum algorithms_t { B, BP, S, SP };

    typedef int (*blake2fn)(FILE *, void *);

    int blake2b_stream(FILE *stream, void *resstream);
    int blake2bp_stream(FILE *stream, void *resstream);
    int blake2s_stream(FILE *stream, void *resstream);
    int blake2sp_stream(FILE *stream, void *resstream);

    typedef int (*blake2bufferfn)(const void *, size_t, void *);

    int blake2b_buffer(const void *buffer, size_t length, void *resstream);
    int blake2bp_buffer(const void *buffer, size_t length, void *resstream);
    int blake2s_buffer(const void *buffer, size_t length, void *resstream);
    int blake2sp_buffer(const void *buffer, size_t length, void *resstream);
}

class Streamer : public node::ObjectWrap
{
    public:
        static NAN_METHOD(New);
        Streamer(int algorithm = 0);
        static void Initialize(v8::Handle<v8::Object> exports);
        void Update(const void *buffer, size_t length);
        void Final();
		size_t resultLen;
		// The 2S hashes emit 32 bytes instead of 64, so we get away with
		// this size.
		unsigned char result[BLAKE2B_OUTBYTES];

    private:
        ~Streamer();

        static NAN_METHOD(UpdateB);
        static NAN_METHOD(FinalB);
        static v8::Persistent<v8::Function> constructor;

        blake2b_state state[1];
        int algorithm;
};

#endif
