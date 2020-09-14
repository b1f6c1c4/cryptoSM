#pragma once

#include <tomcrypt.h>
#include <algorithm>
#include "util.hpp"

inline constexpr auto aes_cipher_size(size_t input)
{
	constexpr size_t block_size = 128 / 8;
	if (input % block_size)
		return input + block_size - input % block_size;
	return input;
}

template <size_t Ma, size_t Mb, size_t Mc, size_t K = 128 / 8>
class garbled_table
{
	static constexpr const size_t C = aes_cipher_size(K);
	typedef std::array<byte_t, K> label_t;
	typedef std::array<byte_t, C> clabel_t;

public:
	template <typename Func>
	void garble(Func fun, prng_state &prng)
	{
		LOG("Garble started");
		for (decltype(auto) l : _la)
      random_fill(l, prng);
		for (decltype(auto) l : _lb)
      random_fill(l, prng);
		for (decltype(auto) l : _lc)
			random_fill(l, prng);

		decltype(auto) ids = raw_vector<size_t>(_sz);
		for (size_t i = 0; i < _sz; i++)
			ids[i] = i;

		{
			decltype(auto) rs = random_vector<size_t>(_sz, prng);
			for (size_t i = 0; i < _sz - 1; i++)
				std::swap(ids[rs[i] % (_sz - i)], ids[_sz - i - 1]);
		}

		size_t a;
		size_t b;
		for (auto &&[target, abid] : zip(_t, ids))
		{
			LOG("Garbling entry #", abid);
			hash_state hash;
			sha256_init(&hash);

			auto r = abid;
			for (auto &&[v, l] : zip(a, _la))
			{
				v = r % l.size();
				r /= l.size();
				sha256_process(&hash, get_ptr(l[v]), get_sz(l[v]));
			}
			for (auto &&[v, l] : zip(b, _lb))
			{
				v = r % l.size();
				r /= l.size();
				sha256_process(&hash, get_ptr(l[v]), get_sz(l[v]));
			}

			decltype(auto) h = raw_vector<>(256 / 8);
			sha256_done(&hash, get_ptr(h));

			size_t c = fun(make_const(a), make_const(b));
			decltype(auto) lc = _lc[c];

			symmetric_CTR ctr;
			auto key = get_ptr(h);
			auto iv = key + 128 / 8;
			RUN(ctr_start(find_cipher("aes"), iv, key, 128 / 8, 0, CTR_COUNTER_LITTLE_ENDIAN, &ctr));
			RUN(ctr_encrypt(get_ptr(lc), get_ptr(target), get_sz(lc), &ctr));
		}
	}

	decltype(auto) get_label_bob(size_t i, size_t v) const
	{
		return _lb[i][v];
	}

	auto dump_size() const
	{
		return 1 * K + Mc * K + _sz * C;
	}

	template <typename Iter, typename Func>
	auto dump(Iter it, Func fun) const
	{
		for (size_t i = 0; i < 1; i++)
		{
			decltype(auto) a = fun(i);
			copy(_la[i][a], it);
			it += K;
		}
		for (decltype(auto) l : _lc)
		{
			copy(l, it);
			it += K;
		}
		copy(_t, it);
		return dump_size();
	}

	template <typename Iter, typename Func>
	static size_t evaluate(Iter it, Func fun)
	{
		LOG("Evalutate started");
		hash_state hash;
		sha256_init(&hash);

		sha256_process(&hash, get_ptr(it), 1 * K);
		it += 1 * K;

		for (size_t i = 0; i < 1; i++)
		{
			decltype(auto) l = fun(i);
			sha256_process(&hash, get_ptr(l), K);
		}

		decltype(auto) h = raw_vector<>(256 / 8);
		sha256_done(&hash, get_ptr(h));

		symmetric_CTR ctr;
		auto key = get_ptr(h);
		auto iv = key + 128 / 8;
		RUN(ctr_start(find_cipher("aes"), iv, key, 128 / 8, 0, CTR_COUNTER_LITTLE_ENDIAN, &ctr));

		clabel_t target;

		auto itx = it + Mc * K;
		for (size_t i = 0; i < _sz; i++)
		{
			LOG("Evaluating entry #", i);
			RUN(ctr_setiv(iv, 128 / 8, &ctr));
			RUN(ctr_decrypt(get_ptr(itx + i * C), get_ptr(target), C, &ctr));
			for (size_t i = 0; i < Mc; i++)
				if (std::equal(it + i * K, it + i * K + K, get_ptr(target)))
					return i;
		}

		return -1;
	}

private:
	constexpr size_t _sz = Ma * Mb;
	std::array<label_t, Ma> _la;
	std::array<label_t, Mb> _lb;
	std::array<label_t, Mc> _lc;
	std::array<clabel_t, _sz> _t;
};
