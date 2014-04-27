#include <node.h>
#include "nan.h"

#include "../blake2_code_20140114/sse/blake2.h"
#include "b2node.h"

#define HERE() ({fprintf(stderr, "@%d\n", __LINE__);})
typedef int ( *blake2fn )( FILE *, void * );

using namespace v8;


enum algorithms_t { B, BP, S, SP };

class BlakeWorker : public NanAsyncWorker
{
	public:
		BlakeWorker(NanCallback *callback, int algo, char* fname)
		: NanAsyncWorker(callback)
			, algorithm(algo)
			, filename(fname)
		{
		}

		~BlakeWorker()
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
					errmsg = strdup("Unknown hash type.");
					return;
			}

			FILE *f = NULL;
			f = fopen(filename, "rb");

			if (!f)
			{
				errmsg = strdup("Could not open file to hash.");
				return;
			}

			if (streamFunc(f, hash) < 0)
			{
				errmsg = strdup("Failed to calculate hash.");
				return;
			}

			fclose(f);
		}

		void HandleOKCallback()
		{
			NanScope();

			Local<Value> argv[] =
			{
				Local<Value>::New(Null()), NanNewBufferHandle(hash, length)
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

NAN_METHOD(Blake2Hash)
{
	NanScope();

	int algo = args[0]->Uint32Value();
	size_t count;
	char* name = NanCString(args[1], &count);
	NanCallback *callback = new NanCallback(args[2].As<Function>());
	NanAsyncQueueWorker(new BlakeWorker(callback, algo, name));

	NanReturnUndefined();
}

void InitAll(Handle<Object> exports)
{
	exports->Set(NanSymbol("blake2"), FunctionTemplate::New(Blake2Hash)->GetFunction());
}

NODE_MODULE(blake2, InitAll)
