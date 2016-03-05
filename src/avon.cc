#include <stdio.h>
#include <node.h>
#include "nan.h"

#include "blake2.h"
#include "avon.h"
#include "streamer.h"

#define HERE() ({fprintf(stderr, "@%d\n", __LINE__);})

using namespace v8;

//------ operate on files

class FileWorker : public Nan::AsyncWorker
{
	public:
		FileWorker(Nan::Callback *callback, int algo, char* fname)
		: Nan::AsyncWorker(callback)
			, algorithm(algo)
			, filename(fname)
		{
		}

		~FileWorker()
		{
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
			Nan::HandleScope();
			Local<Value> argv[] =
			{
				Nan::Null(),
				Nan::CopyBuffer(hash, length).ToLocalChecked()
			};
			callback->Call(2, argv);
		};

	private:
		int algorithm;
		char* filename;
		size_t length;
		// The 2S hashes emit 32 bytes instead of 64, so we get away with this size.
		char hash[BLAKE2B_OUTBYTES];
};

NAN_METHOD(HashFile)
{
	Nan::HandleScope();

	int algo = info[0]->Uint32Value();
	Nan::Utf8String* name = new Nan::Utf8String(info[1]);
	Nan::Callback *callback = new Nan::Callback(info[2].As<Function>());
	Nan::AsyncQueueWorker(new FileWorker(callback, algo, **name));
}

//------ operate on buffers

class BufferWorker : public Nan::AsyncWorker
{
	public:
		BufferWorker(int algo, char* buf, size_t bufferLen, Nan::Callback *callback)
		: Nan::AsyncWorker(callback)
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
			Nan::HandleScope();
			Local<Value> argv[] =
			{
				Nan::Null(),
				Nan::CopyBuffer(hash, resultLen).ToLocalChecked()
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
	Nan::HandleScope();

	int algo = info[0]->Uint32Value();
	Local<Object> buffer = info[1].As<Object>();
	size_t length = node::Buffer::Length(buffer);
	char* data = node::Buffer::Data(buffer);

	Nan::Callback *callback = new Nan::Callback(info[2].As<Function>());
	Nan::AsyncQueueWorker(new BufferWorker(algo, data, length, callback));
}

// ------------ ceremony

NAN_MODULE_INIT(InitAll)
{
	Nan::Set(target,
		Nan::New<String>("b2_file").ToLocalChecked(),
		Nan::GetFunction(Nan::New<FunctionTemplate>(HashFile)).ToLocalChecked()
	);
	Nan::Set(target,
		Nan::New<String>("b2_buffer").ToLocalChecked(),
		Nan::GetFunction(Nan::New<FunctionTemplate>(HashBuffer)).ToLocalChecked()
	);
	Streamer::Initialize(target);
}

NODE_MODULE(blake2, InitAll)
