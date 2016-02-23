#ifndef STREAMER_H
#define STREAMER_H

#include <node.h>

class Streamer : public node::ObjectWrap
{
    public:
        static NAN_METHOD(New);
        Streamer(int algorithm = 0);
        static void Initialize(v8::Handle<v8::Object> target);
        void Update(const void *buffer, size_t length);
        void Final();
        size_t resultLen;
        // The 2S hashes emit 32 bytes instead of 64, so we get away with
        // this size.
        unsigned char result[BLAKE2B_OUTBYTES];
        static v8::Persistent<v8::Function> constructor;

    private:
        ~Streamer();

        static NAN_METHOD(UpdateB);
        static NAN_METHOD(FinalB);

        blake2b_state state[1];
        int algorithm;
};

#endif
