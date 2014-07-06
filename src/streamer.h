#ifndef STREAMER_H
#define STREAMER_H

#include <node.h>

class Streamer : public node::ObjectWrap
{
    public:
        static void Initialize(v8::Handle<v8::Object> exports);

    private:
        explicit Streamer(int algorithm = 0);
        ~Streamer();

        static v8::Handle<v8::Value> New(const v8::Arguments& args);
        static v8::Handle<v8::Value> PlusOne(const v8::Arguments& args);
        static v8::Persistent<v8::Function> constructor;

        blake2b_state state[1];
        int algorithm;
		char* buffer;
		size_t bufferLen;
		size_t resultLen;
		// The 2S hashes emit 32 bytes instead of 64, so we get away with
		// this size.
		char hash[BLAKE2B_OUTBYTES];

};

#endif
