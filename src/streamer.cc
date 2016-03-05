#include <ctype.h>
#include <stdio.h>

#include <node.h>
#include "nan.h"

#include "blake2.h"
#include "avon.h"

#define HERE() ({fprintf(stderr, "@%d\n", __LINE__);})

using namespace v8;
using namespace node;

Streamer::Streamer(int algo) : algorithm(algo)
{
	resultLen = BLAKE2B_OUTBYTES;
	blake2b_init(state, resultLen);
}

Streamer::~Streamer()
{
}

NAN_MODULE_INIT(Streamer::Initialize)
{
	v8::Local<v8::FunctionTemplate> t = Nan::New<v8::FunctionTemplate>(New);

	t->SetClassName(Nan::New<String>("Streamer").ToLocalChecked());
	t->InstanceTemplate()->SetInternalFieldCount(1);

	Nan::SetPrototypeMethod(t, "update", UpdateB);
	Nan::SetPrototypeMethod(t, "final", FinalB);

	constructor().Reset(Nan::GetFunction(t).ToLocalChecked());
	Nan::Set(target, Nan::New("Streamer").ToLocalChecked(), Nan::GetFunction(t).ToLocalChecked());
}

NAN_METHOD(Streamer::New)
{
	Nan::HandleScope();

	if (info.IsConstructCall())
	{
		int algo = info[0]->Uint32Value();
		Streamer* obj = new Streamer(algo);
		obj->Wrap(info.This());
		printf("wrapped\n");
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

NAN_METHOD(Streamer::UpdateB)
{
	Nan::HandleScope();

	Streamer* hash = ObjectWrap::Unwrap<Streamer>(info.Holder());
	Local<Object> buffer = info[1].As<Object>();
	size_t length = node::Buffer::Length(buffer);
	char* data = node::Buffer::Data(buffer);

	hash->Update(data, length);
}

NAN_METHOD(Streamer::FinalB)
{
	Nan::HandleScope();
	Streamer* hash = ObjectWrap::Unwrap<Streamer>(info.Holder());
	hash->Final();
	info.GetReturnValue().Set(Nan::CopyBuffer((const char *)hash->result, hash->resultLen).ToLocalChecked());
}

void Streamer::Update(const void *buffer, size_t length)
{
	blake2b_update(state, (unsigned char *)buffer, length);
}

void Streamer::Final()
{
	blake2b_final(state, result, resultLen);
}
