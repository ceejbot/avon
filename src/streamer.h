#ifndef STREAMER_H
#define STREAMER_H

#include <node.h>
#include "avon.h"

class Blake2Algorithm
{
	public:
		Blake2Algorithm(size_t len): mLength(len) {}
		virtual ~Blake2Algorithm(){}

		virtual void Update(const void *buffer, size_t length) = 0;
		virtual void Final() = 0;

		size_t mLength;
		// The 2S hashes emit 32 bytes instead of 64, so we get away with this size.
		unsigned char mResult[BLAKE2B_OUTBYTES];
};

class AvonStream : public node::ObjectWrap
{
	public:
		static NAN_MODULE_INIT(Initialize);
		static NAN_METHOD(New);

		AvonStream(int algorithm = 0);
		static NAN_METHOD(Update);
		static NAN_METHOD(Final);

	private:
		~AvonStream();
		Blake2Algorithm* mHash;

		static inline Nan::Persistent<v8::Function> & constructor()
		{
			static Nan::Persistent<v8::Function> cons;
			return cons;
		}
};

class Blake2B : public Blake2Algorithm
{
	public:
		Blake2B();
		void Update(const void *buffer, size_t length);
		void Final();

	private:
		blake2b_state mState[1];
};

class Blake2BP : public Blake2Algorithm
{
	public:
		Blake2BP();
		void Update(const void *buffer, size_t length);
		void Final();

	private:
		blake2bp_state mState[1];
};

class Blake2S : public Blake2Algorithm
{
	public:
		Blake2S();
		void Update(const void *buffer, size_t length);
		void Final();

	private:
		blake2s_state mState[1];
};

class Blake2SP : public Blake2Algorithm
{
	public:
		Blake2SP();
		void Update(const void *buffer, size_t length);
		void Final();

	private:
		blake2sp_state mState[1];
};


#endif
