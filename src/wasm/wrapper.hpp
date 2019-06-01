#pragma once

#include <tomcrypt.h>
#include <utility>
#include <functional>
#include "garbled_table.hpp"
#include "oblivious_transfer.hpp"

#define BIND(obj, fun, ...) std::bind(&decltype(obj)::fun, &obj, __VA_ARGS__)

using namespace std::placeholders;

template <size_t Na, size_t Nb, size_t K = 128 / 8, size_t KN = 1024 / 8>
class wrapper_base
{
public:
	template <typename ContainerA, typename ContainerB>
	wrapper_base(const ContainerA &mita, const ContainerB &mitb, size_t mc)
		: _sz{1}, _mc{mc}, _ma{0}, _mb{0}
	{
		for (auto m : mita)
			_sz *= m;
		for (auto m : mitb)
			_sz *= m;

		for (auto m : mita)
			_ma += m;
		for (auto m : mitb)
			_mb += m;
	}

	auto garble_size() const
	{
		return KN + _mb * KN;
	}

	auto inquiry_size() const
	{
		return Nb * KN;
	}

	auto receive_size() const
	{
		return _mb * KN + _ma * K + _mc + K + _sz * aes_cipher_size(K);
	}

protected:
	size_t _sz, _mc;
	size_t _ma, _mb;
};

template <size_t Na, size_t Nb, size_t K = 128 / 8, size_t KN = 1024 / 8>
class wrapper_alice : public wrapper_base<Na, Nb, K, KN>
{
public:
	template <typename ContainerA, typename ContainerB>
	wrapper_alice(const ContainerA &mita, const ContainerB &mitb, size_t mc)
		: wrapper_base<Na, Nb, K, KN>(mita, mitb, mc),
		  _tbl(mita, mitb, mc)
	{
		_ot.reserve(Nb);
		for (size_t i = 0; i < Nb; i++)
			_ot.emplace_back(mitb[i]);
	}

	template <typename Func, typename Iter>
	auto garble(Iter it, prng_state &prng, Func fun)
	{
		_tbl.garble(fun, prng);
		for (decltype(auto) o : _ot)
			o.initiate(prng);

		for (decltype(auto) o : _ot)
		{
			it += o.dump_crypt(it);
			it += o.dump(it);
		}

		return it;
	}

	template <typename IterA, typename Func, typename IterB>
	auto receive(IterA ita, IterB itb, Func fun)
	{
		for (size_t i = 0; i < Nb; i++)
		{
			decltype(auto) o = _ot[i];
			ita += o.receive(ita, BIND(_tbl, get_label_bob, i, _1));
			itb += o.dump(itb);
		}
		itb += _tbl.dump(itb, fun);

		return itb;
	}

private:
	garbled_table<Na, Nb, K> _tbl;
	std::vector<oblivious_transfer_sender<KN>> _ot;
};

template <size_t Na, size_t Nb, size_t K = 128 / 8, size_t KN = 1024 / 8>
class wrapper_bob : public wrapper_base<Na, Nb, K, KN>
{
public:
	template <typename ContainerA, typename ContainerB>
	wrapper_bob(const ContainerA &mita, const ContainerB &mitb, size_t mc)
		: wrapper_base<Na, Nb, K, KN>(mita, mitb, mc)
	{
		_ot.reserve(Nb);
		for (size_t i = 0; i < Nb; i++)
			_ot.emplace_back(mitb[i]);
	}

	template <typename IterA, typename Func, typename IterB>
	auto inquiry(IterA ita, prng_state &prng, IterB itb, Func fun)
	{
		for (size_t i = 0; i < Nb; i++)
		{
			decltype(auto) o = _ot[i];
			decltype(auto) b = fun(i);
			ita += o.initiate(ita, b, prng);
		}

		for (decltype(auto) o : _ot)
			itb += copy(o.get_result(), itb);

		return itb;
	}

	template <typename Iter>
	auto evaluate(Iter it)
	{
		for (decltype(auto) o : _ot)
			it += o.receive(it);

		return garbled_table<Na, Nb, K>::evaluate(
				wrapper_base<Na, Nb, K, KN>::_sz,
				wrapper_base<Na, Nb, K, KN>::_mc,
				it,
				[this](size_t id){
					return get_ptr(_ot[id].get_result()) + KN - K;
				});
	}

private:
	std::vector<oblivious_transfer_receiver<KN>> _ot;
};

#undef BIND
