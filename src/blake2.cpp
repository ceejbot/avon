#include <stdio.h>
#include <node.h>
#include "nan.h"

#include "../blake2_code_20140114/sse/blake2.h"
#include "b2node.h"

#define HERE() ({fprintf(stderr, "@%d\n", __LINE__);})

using namespace v8;

enum algorithms_t { B, BP, S, SP };

//------ operate on files

class FileWorker : public NanAsyncWorker
{
	public:
		FileWorker(NanCallback *callback, int algo, char* fname)
		: NanAsyncWorker(callback)
			, algorithm(algo)
			, filename(fname)
		{
		}

		~FileWorker()
		{
			delete [] filename;
		}

		void Execute()
		{
			blake2fn streamFunc;

			switch (algorithm)
			{
				case B:
					streamFunc = blake2b_stream;
					length = BLAKE2B_OUTBYTES;
					break;

				case BP:
					streamFunc = blake2bp_stream;
					length = BLAKE2B_OUTBYTES;
					break;

				case S:
					streamFunc = blake2s_stream;
					length = BLAKE2S_OUTBYTES;
					break;

				case SP:
					streamFunc = blake2sp_stream;
					length = BLAKE2S_OUTBYTES;
					break;

				default:
					SetErrorMessage("Unknown hash type.");
					return;
			}

			FILE *f = NULL;
			f = fopen(filename, "rb");

			if (!f)
			{
				SetErrorMessage("Could not open file to hash.");
				return;
			}

			if (streamFunc(f, hash) < 0)
			{
				SetErrorMessage("Failed to calculate hash.");
				return;
			}

			fclose(f);
		}

		void HandleOKCallback()
		{
			NanScope();
			Local<Value> argv[] =
			{
				Local<Value>::New(Null()),
				NanNewBufferHandle(hash, length)
			};
			callback->Call(2, argv);
		};

	private:
		int algorithm;
		char* filename;
		size_t length;
		// The 2S hashes emit 32 bytes instead of 64, so we get away with
		// this size.
		char hash[BLAKE2B_OUTBYTES];
};

NAN_METHOD(HashFile)
{
	NanScope();

	int algo = args[0]->Uint32Value();
	size_t count;
	char* name = NanCString(args[1], &count);
	NanCallback *callback = new NanCallback(args[2].As<Function>());
	NanAsyncQueueWorker(new FileWorker(callback, algo, name));

	NanReturnUndefined();
}

//------ operate on buffers

class BufferWorker : public NanAsyncWorker
{
	public:
		BufferWorker(int algo, char* buf, size_t length, NanCallback *callback)
		: NanAsyncWorker(callback)
			, algorithm(algo)
			, buffer(buf)
			, length(length)
		{
		}

		~BufferWorker()
		{
		}

		void Execute()
		{
			blake2bufferfn func;

			switch (algorithm)
			{
				case B:
					func = blake2s_buffer;
					length = BLAKE2B_OUTBYTES;
					break;

				case BP:
					func = blake2bp_buffer;
					length = BLAKE2B_OUTBYTES;
					break;

				case S:
					func = blake2s_buffer;
					length = BLAKE2S_OUTBYTES;
					break;

				case SP:
					func = blake2sp_buffer;
					length = BLAKE2S_OUTBYTES;
					break;

				default:
					SetErrorMessage("Unknown hash type.");
					return;
			}

			if (func(buffer, length, hash) < 0)
			{
				SetErrorMessage("Failed to calculate hash.");
				return;
			}
		}

		void HandleOKCallback()
		{
			NanScope();
			Local<Value> argv[] =
			{
				Local<Value>::New(Null()),
				NanNewBufferHandle(hash, length)
			};
			callback->Call(2, argv);
		};

	private:
		int algorithm;
		char* buffer;
		size_t length;
		// The 2S hashes emit 32 bytes instead of 64, so we get away with
		// this size.
		char hash[BLAKE2B_OUTBYTES];
};

NAN_METHOD(HashBuffer)
{
	NanScope();

	int algo = args[0]->Uint32Value();
	size_t length = node::Buffer::Length(args[1]->ToObject());
	char* data = node::Buffer::Data(args[1]->ToObject());

	NanCallback *callback = new NanCallback(args[2].As<Function>());
	NanAsyncQueueWorker(new BufferWorker(algo, data, length, callback));

	NanReturnUndefined();
}

// ------------ ceremony

void InitAll(Handle<Object> exports)
{
	exports->Set(NanNew<String>("blake2_file"), FunctionTemplate::New(HashFile)->GetFunction());
	exports->Set(NanNew<String>("blake2_buffer"), FunctionTemplate::New(HashBuffer)->GetFunction());
}

NODE_MODULE(blake2, InitAll)
