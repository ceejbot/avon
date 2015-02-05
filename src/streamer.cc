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

void Streamer::Initialize(Handle<Object> exports, Handle<Object> module)
{
    Local<FunctionTemplate> t = NanNew<FunctionTemplate>(New);

    t->SetClassName(NanNew<String>("Streamer"));
    t->InstanceTemplate()->SetInternalFieldCount(1);
    NODE_SET_PROTOTYPE_METHOD(t, "update", UpdateB);
    NODE_SET_PROTOTYPE_METHOD(t, "final", FinalB);

    NanAssignPersistent<v8::Function>(constructor, t->GetFunction());
    exports->Set(NanNew<String>("Streamer"), t->GetFunction());
}

NAN_METHOD(Streamer::New)
{
    NanScope();

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
        Local<Function> cons = NanNew<Function>(constructor);
        NanReturnValue(cons->NewInstance(argc, argv));
    }
}

NAN_METHOD(Streamer::UpdateB)
{
    NanScope();

    Streamer* hash = ObjectWrap::Unwrap<Streamer>(args.Holder());
	Local<Object> buffer = args[1].As<Object>();
	size_t length = node::Buffer::Length(buffer);
	char* data = node::Buffer::Data(buffer);

    hash->Update(data, length);

    NanReturnUndefined();
}

NAN_METHOD(Streamer::FinalB)
{
    NanScope();
    Streamer* hash = ObjectWrap::Unwrap<Streamer>(args.Holder());
    hash->Final();
    NanReturnValue(NanNewBufferHandle((char *)hash->result, hash->resultLen));
}

void Streamer::Update(const void *buffer, size_t length)
{
	blake2b_update(state, (unsigned char *)buffer, length);
}

void Streamer::Final()
{
    blake2b_final(state, result, resultLen);
}
