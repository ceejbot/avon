#include <stdio.h>
#include <node.h>
#include "nan.h"

#include "blake2.h"
#include "avon.h"

#define HERE() ({fprintf(stderr, "@%d\n", __LINE__);})

using namespace v8;

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
		BufferWorker(int algo, char* buf, size_t bufferLen, NanCallback *callback)
		: NanAsyncWorker(callback)
			, algorithm(algo)
			, buffer(buf)
			, bufferLen(bufferLen)
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
					func = blake2b_buffer;
					resultLen = BLAKE2B_OUTBYTES;
					break;

				case BP:
					func = blake2bp_buffer;
					resultLen = BLAKE2B_OUTBYTES;
					break;

				case S:
					func = blake2s_buffer;
					resultLen = BLAKE2S_OUTBYTES;
					break;

				case SP:
					func = blake2sp_buffer;
					resultLen = BLAKE2S_OUTBYTES;
					break;

				default:
					SetErrorMessage("Unknown hash type.");
					return;
			}

			if (func(buffer, bufferLen, hash) < 0)
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
				NanNewBufferHandle(hash, resultLen)
			};
			callback->Call(2, argv);
		};

	private:
		int algorithm;
		char* buffer;
		size_t bufferLen;
		size_t resultLen;
		// The 2S hashes emit 32 bytes instead of 64, so we get away with
		// this size.
		char hash[BLAKE2B_OUTBYTES];
};

NAN_METHOD(HashBuffer)
{
	NanScope();

	int algo = args[0]->Uint32Value();
	Local<Object> buffer = args[1].As<Object>();
	size_t length = node::Buffer::Length(buffer);
	char* data = node::Buffer::Data(buffer);

	NanCallback *callback = new NanCallback(args[2].As<Function>());
	NanAsyncQueueWorker(new BufferWorker(algo, data, length, callback));

	NanReturnUndefined();
}

// ------------ ceremony

void InitAll(Handle<Object> exports)
{
	exports->Set(NanNew<String>("b2_file"), FunctionTemplate::New(HashFile)->GetFunction());
	exports->Set(NanNew<String>("b2_buffer"), FunctionTemplate::New(HashBuffer)->GetFunction());
	Streamer::Initialize(exports);
	exports->Set(NanNew<String>("b2_stream"), FunctionTemplate::New(Streamer::New)->GetFunction());
}

NODE_MODULE(blake2, InitAll)
