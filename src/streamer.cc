#include <ctype.h>
#include <stdio.h>

#include <node.h>
#include "nan.h"

#include "blake2.h"
#include "avon.h"
#include "streamer.h"

#define HERE() ({fprintf(stderr, "@%d\n", __LINE__);})

using namespace v8;
using namespace node;

NAN_METHOD(AvonStream::New)
{
	if (info.IsConstructCall())
	{
		int algo = info[0]->IsUndefined() ? 0 : Nan::To<int>(info[0]).FromJust();
		AvonStream* obj = new AvonStream(algo);
		obj->Wrap(info.This());
		info.GetReturnValue().Set(info.This());
	}
	else
	{
		const int argc = 1;
		Local<Value> argv[argc] = { info[0] };
		v8::Local<v8::Function> cons = Nan::New(constructor());
		info.GetReturnValue().Set(Nan::NewInstance(cons, argc, argv).ToLocalChecked());
	}
}

AvonStream::AvonStream(int algorithm)
{
	switch (algorithm)
	{
		case B:
		default:
			mHash = new Blake2B();
			break;

		case BP:
			mHash = new Blake2BP();
			break;

		case S:
			mHash = new Blake2S();
			break;

		case SP:
			mHash = new Blake2SP();
			break;
	}
}

AvonStream::~AvonStream()
{
	delete mHash;
}

NAN_METHOD(AvonStream::Update)
{
	AvonStream* obj = ObjectWrap::Unwrap<AvonStream>(info.Holder());
	Local<Object> buffer = info[0].As<Object>();
	size_t length = node::Buffer::Length(buffer);
	char* data = node::Buffer::Data(buffer);
	obj->mHash->Update(data, length);
}

NAN_METHOD(AvonStream::Final)
{
	AvonStream* obj = ObjectWrap::Unwrap<AvonStream>(info.Holder());
	obj->mHash->Final();
	info.GetReturnValue().Set(Nan::CopyBuffer((const char *)obj->mHash->mResult, obj->mHash->mLength).ToLocalChecked());
}

// --- blake2 algorithms

Blake2B::Blake2B():Blake2Algorithm(BLAKE2B_OUTBYTES)
{
	blake2b_init(mState, mLength);
}

void Blake2B::Update(const void *buffer, size_t length)
{
	blake2b_update(mState, (unsigned char *)buffer, length);
}

void Blake2B::Final()
{
	blake2b_final(mState, mResult, mLength);
}

Blake2BP::Blake2BP():Blake2Algorithm(BLAKE2B_OUTBYTES)
{
	blake2bp_init(mState, mLength);
}

void Blake2BP::Update(const void *buffer, size_t length)
{
	blake2bp_update(mState, (unsigned char *)buffer, length);
}

void Blake2BP::Final()
{
	blake2bp_final(mState, mResult, mLength);
}

Blake2S::Blake2S():Blake2Algorithm(BLAKE2S_OUTBYTES)
{
	blake2s_init(mState, mLength);
}

void Blake2S::Update(const void *buffer, size_t length)
{
	blake2s_update(mState, (unsigned char *)buffer, length);
}

void Blake2S::Final()
{
	blake2s_final(mState, mResult, mLength);
}

Blake2SP::Blake2SP():Blake2Algorithm(BLAKE2S_OUTBYTES)
{
	blake2sp_init(mState, mLength);
}

void Blake2SP::Update(const void *buffer, size_t length)
{
	blake2sp_update(mState, (unsigned char *)buffer, length);
}

void Blake2SP::Final()
{
	blake2sp_final(mState, mResult, mLength);
}

// --- v8 module ceremony

NAN_MODULE_INIT(AvonStream::Initialize)
{
	v8::Local<v8::FunctionTemplate> t = Nan::New<v8::FunctionTemplate>(New);

	t->SetClassName(Nan::New<String>("AvonStream").ToLocalChecked());
	t->InstanceTemplate()->SetInternalFieldCount(2);

	Nan::SetPrototypeMethod(t, "update", AvonStream::Update);
	Nan::SetPrototypeMethod(t, "final", AvonStream::Final);

	constructor().Reset(Nan::GetFunction(t).ToLocalChecked());
	Nan::Set(target, Nan::New("AvonStream").ToLocalChecked(), Nan::GetFunction(t).ToLocalChecked());
}
