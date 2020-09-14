#include <iostream>
#include <tomcrypt.h>
#include <emscripten.h>
#include <emscripten/bind.h>
#include "simple_min.hpp"

inline char int2char(int input)
{
	if (input < 0 || input >= 16)
		throw std::invalid_argument("Invalid output string");
	if (input >= 10)
		return input - 10 + 'a';
	return input + '0';
}

template <typename Iter, typename Container>
inline void dump_hex(Iter d, const Container &c)
{
	auto ptr = get_ptr(c);
	for (size_t i = 0; i < get_sz(c); i++)
	{
		d[i * 2] = int2char(ptr[i] / 16);
		d[i * 2 + 1] = int2char(ptr[i] % 16);
	}
}

inline unsigned int char2int(char input)
{
	if (input >= '0' && input <= '9')
		return input - '0';
	if (input >= 'A' && input <= 'F')
		return input - 'A' + 10;
	if (input >= 'a' && input <= 'f')
		return input - 'a' + 10;
	throw std::invalid_argument("Invalid input string");
}

template <typename Iter, typename Container>
inline void load_hex(Iter s, Container &c)
{
	auto ptr = get_ptr(c);
	for (size_t i = 0; i < get_sz(c); i++)
		ptr[i] = char2int(s[i * 2]) * 16 + char2int(s[i * 2 + 1]);
}

int main()
{
	register_all_ciphers();
	register_all_hashes();
	register_all_prngs();
	ltc_mp = ltm_desc;
}

using namespace emscripten;

template <size_t M>
EMSCRIPTEN_KEEPALIVE
constexpr size_t garble_size()
{
	return simple_min_base<M>::Garble_size();
}

template <size_t M>
EMSCRIPTEN_KEEPALIVE
constexpr size_t inquiry_size()
{
	return simple_min_base<M>::Inquiry_size();
}

template <size_t M>
EMSCRIPTEN_KEEPALIVE
constexpr size_t receive_size()
{
	return simple_min_base<M>::Receive_size();
}

template <size_t M>
class alice_t
{
	alice_t(size_t a) : _alice(a) { }

public:
	EMSCRIPTEN_KEEPALIVE
	static auto create(size_t a) { return new alice_t(a); }
	EMSCRIPTEN_KEEPALIVE
	static void remove(alice_t *o) { delete o; }

	EMSCRIPTEN_KEEPALIVE
	void garble(unsigned char *out)
	{
		prng_state prng;
		RUN(rng_make_prng(128, find_prng("yarrow"), &prng, NULL));

		_alice.garble(out, prng);
	}

	EMSCRIPTEN_KEEPALIVE
	void receive(const unsigned char *in, unsigned char *out)
	{
		_alice.receive(in, out);
	}

private:
	simple_min_alice<M> _alice;
};

template <size_t M>
class bob_t
{
	bob_t(size_t b) : _bob(b) { }

public:
	EMSCRIPTEN_KEEPALIVE
	static auto create(size_t b) { return new bob_t(b); }
	EMSCRIPTEN_KEEPALIVE
	static void remove(bob_t *o) { delete o; }

	EMSCRIPTEN_KEEPALIVE
	void inquiry(const unsigned char *in, unsigned char *out)
	{
		prng_state prng;
		RUN(rng_make_prng(128, find_prng("yarrow"), &prng, NULL));

		_bob.inquiry(in, prng, out);
	}

	EMSCRIPTEN_KEEPALIVE
	size_t evaluate(const unsigned char *in)
	{
		return _bob.evaluate(in);
	}

private:
	simple_min_bob<M> _bob;
};

template <size_t M>
EMSCRIPTEN_KEEPALIVE
constexpr size_t alice_size()
{
	return sizeof(alice_t<M>);
}

template <size_t M>
EMSCRIPTEN_KEEPALIVE
constexpr size_t bob_size()
{
	return sizeof(bob_t<M>);
}

#define MAKE(M) \
	template class alice_t<M>; \
	template class bob_t<M>; \
	template size_t alice_size<M>(); \
	template size_t bob_size<M>(); \
	template size_t garble_size<M>(); \
	template size_t inquiry_size<M>(); \
	template size_t receive_size<M>();

MAKE(2);
MAKE(4);
