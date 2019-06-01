#pragma once

#include "wrapper.hpp"
#include <array>

template <size_t M, size_t K = 128 / 8, size_t KN = 1024 / 8>
class simple_min_base
{
public:
	static constexpr auto Garble_size()
	{
		return KN + M * KN;
	}

	static constexpr auto Inquiry_size()
	{
		return KN;
	}

	static constexpr auto Receive_size()
	{
		return M * KN + K + M * K + M * M * aes_cipher_size(K);
	}
};

template <size_t M, size_t K = 128 / 8, size_t KN = 1024 / 8>
class simple_min_alice
	: public simple_min_base<M, K, KN>,
	  protected wrapper_alice<1, 1, K, KN>
{
public:
	simple_min_alice(size_t a)
		: wrapper_alice<1, 1, K, KN>(
				std::array<size_t, 1>{ M },
				std::array<size_t, 1>{ M },
				M),
		 _a{a} { }

	template <typename Iter>
	auto garble(Iter it, prng_state &prng)
	{
		return wrapper_alice<1, 1, K, KN>::garble(it, prng,
				[](const auto &as, const auto &bs){
					return std::min(as[0], bs[0]);
				});
	}

	template <typename IterA, typename IterB>
	auto receive(IterA ita, IterB itb)
	{
		return wrapper_alice<1, 1, K, KN>::receive(ita, itb, [this](auto){return _a;});
	}

private:
	size_t _a;
};

template <size_t M, size_t K = 128 / 8, size_t KN = 1024 / 8>
class simple_min_bob
	: public simple_min_base<M, K, KN>,
	  protected wrapper_bob<1, 1, K, KN>
{
public:
	simple_min_bob(size_t b)
		: wrapper_bob<1, 1, K, KN>(
				std::array<size_t, 1>{ M },
				std::array<size_t, 1>{ M },
				M),
		 _b{b} { }

	template <typename IterA, typename IterB>
	auto inquiry(IterA ita, prng_state &prng, IterB itb)
	{
		return wrapper_bob<1, 1, K, KN>::inquiry(ita, prng, itb,
				[this](auto){return _b;});
	}

	template <typename Iter>
	auto evaluate(Iter it)
	{
		return wrapper_bob<1, 1, K, KN>::evaluate(it);
	}

private:
	size_t _b;
};
