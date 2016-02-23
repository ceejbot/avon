#include <ctype.h>
#include <stdio.h>

#include <node.h>
#include "nan.h"

#include "blake2.h"
#include "avon.h"

#define HERE() ({fprintf(stderr, "@%d\n", __LINE__);})

using namespace v8;
using namespace node;

Persistent<Function> Streamer::constructor;

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
    Local<FunctionTemplate> t = Nan::New<FunctionTemplate>(New);

    t->SetClassName(Nan::New<String>("Streamer").ToLocalChecked());
    t->InstanceTemplate()->SetInternalFieldCount(1);
    NODE_SET_PROTOTYPE_METHOD(t, "update", UpdateB);
    NODE_SET_PROTOTYPE_METHOD(t, "final", FinalB);

    NanAssignPersistent<v8::Function>(constructor, t->GetFunction());
    Nan::Set(target,
        Nan::New<String>("Streamer").ToLocalChecked(),
        Nan::GetFunction(Nan::New<FunctionTemplate>(HashBuffer)).ToLocalChecked()
    );
}

NAN_METHOD(Streamer::New)
{
    Nan::HandleScope();

    if (args.IsConstructCall())
    {
    	int algo = args[0]->Uint32Value();
        Streamer* obj = new Streamer(algo);
        obj->Wrap(args.This());
        printf("wrapped\n");
        NanReturnValue(args.This());
    }
    else
    {
        const int argc = 1;
        Local<Value> argv[argc] = { args[0] };
        Local<Function> cons = Nan::New<Function>(constructor);
        NanReturnValue(cons->NewInstance(argc, argv));
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
    NanReturnValue(Nan::NewBufferHandle((char *)hash->result, hash->resultLen));
}

void Streamer::Update(const void *buffer, size_t length)
{
	blake2b_update(state, (unsigned char *)buffer, length);
}

void Streamer::Final()
{
    blake2b_final(state, result, resultLen);
}
