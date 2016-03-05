#ifndef STREAMER_H
#define STREAMER_H

#include <node.h>

class Streamer : public node::ObjectWrap
{
	public:
		static NAN_MODULE_INIT(Initialize);
		static NAN_METHOD(New);

		Streamer(int algorithm = 0);
		void Update(const void *buffer, size_t length);
		void Final();

	private:
		~Streamer();

		static NAN_METHOD(UpdateB);
		static NAN_METHOD(FinalB);

		static inline Nan::Persistent<v8::Function> & constructor()
		{
			static Nan::Persistent<v8::Function> cons;
			return cons;
		}

		blake2b_state state[1];
		int algorithm;
		size_t resultLen;
		// The 2S hashes emit 32 bytes instead of 64, so we get away with
		// this size.
		unsigned char result[BLAKE2B_OUTBYTES];
};

#endif
