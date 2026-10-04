import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CaretDown, Phone, EnvelopeSimple, WhatsappLogo, MapPin, UserCircle } from '@phosphor-icons/react'
import { STORE, COMMERCE } from '../config'
import { CLOTHING_CHART, FOOTWEAR_CHART } from '../data/sizeCharts'
import { Breadcrumbs } from '../components/ui'
import NotFound from './NotFound'

const S = STORE.seller

const PAGES = {
  privacy: {
    title: 'Privacy notice',
    sections: [
      ['What we collect', 'Your name, mobile number, email, delivery address and order history. If you create a child profile, we store only the age band and gender you choose to share. We never ask for children\'s names or photos.'],
      ['Why we collect it', 'To deliver your orders, send order updates on WhatsApp, SMS or email, process returns, and, only with your consent, send offers and measure what works on our site.'],
      ['Your consent and choices', 'You can accept all cookies or essential cookies only. You can withdraw marketing consent at any time from any message or your account.'],
      ['Your rights under the DPDP Act, 2023', 'You can see, correct or delete your personal data. Use "Delete my account" in your profile, or write to our grievance officer. Order records are kept as long as GST law requires.'],
      ['Who we share it with', 'Only with the payment gateway, courier partners and messaging providers needed to complete your order. We do not sell your data.'],
    ],
  },
  terms: {
    title: 'Terms of use',
    sections: [
      ['About this store', `This store is operated by ${S.legalName}, ${S.address}. GSTIN ${S.gstin}.`],
      ['Prices', 'All prices are in Indian rupees and include GST. The price you see at checkout, including any shipping or COD fee, is the final amount you pay.'],
      ['Orders', 'An order is confirmed once you receive an order ID. We may cancel an order if an item is out of stock or a pincode cannot be served, with a full refund.'],
      ['Product information', 'We try to show colours accurately, but screens vary. Country of origin, manufacturer and MRP are listed on every product page.'],
    ],
  },
  shipping: {
    title: 'Shipping and delivery',
    sections: [
      ['Charges', `Free shipping on orders above ₹${COMMERCE.freeShippingThreshold}. Below that, a flat ₹${COMMERCE.shippingFee} applies.`],
      ['Delivery time', 'Metro cities: 2 to 4 days. Rest of India: 4 to 7 days. Check the exact date with your pincode on any product page.'],
      ['Cash on delivery', `Available on orders up to ₹${COMMERCE.codMaxOrder.toLocaleString('en-IN')} in serviceable pincodes, with a ₹${COMMERCE.codFee} handling fee. COD orders are confirmed with a one-time code.`],
      ['Tracking', 'You will get tracking updates on WhatsApp and SMS, and can track any time on our Track order page.'],
    ],
  },
  returns: {
    title: 'Returns, exchanges and refunds',
    sections: [
      ['Easy returns', `Return or exchange within ${COMMERCE.returnDays} days of delivery. Items must be unused, unwashed and have tags attached.`],
      ['How it works', 'Request a return from your order page. A courier picks it up from your door. After a quick quality check, we ship your exchange or process your refund.'],
      ['Refunds', 'Prepaid orders are refunded to the original payment method in 3 to 5 working days. COD orders are refunded by bank transfer or store credit.'],
      ['Not returnable', 'Innerwear, socks and items marked as non-returnable for hygiene reasons.'],
    ],
  },
  cancellation: {
    title: 'Cancellation policy',
    sections: [
      ['Before shipping', 'You can cancel any order from your account until it is shipped. Prepaid orders are refunded in full.'],
      ['After shipping', 'Once shipped, you can refuse delivery or request a return after it arrives.'],
    ],
  },
}

const FAQ = [
  ['How do I choose the right size?', 'Every product has a size chart by age, and a Find my size tool. If your child is between sizes, pick the bigger one.'],
  ['Is cash on delivery available?', `Yes, on orders up to ₹${COMMERCE.codMaxOrder.toLocaleString('en-IN')} in most pincodes. Check yours on the product page.`],
  ['How long does delivery take?', 'Usually 2 to 4 days in metros and 4 to 7 days elsewhere.'],
  ['Can I exchange for a different size?', `Yes, free size exchanges within ${COMMERCE.returnDays} days, picked up from your door.`],
  ['Will I get a GST invoice?', 'Yes. Download it any time from your order page.'],
  ['Can I send an order as a gift?', 'Yes. Tick "This is a gift" at checkout to add a message and hide prices on the packing slip.'],
]

function Contact() {
  const G = STORE.grievanceOfficer
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[
        [Phone, 'Call us', STORE.supportPhone, `tel:${STORE.supportPhone.replace(/\s/g, '')}`],
        [WhatsappLogo, 'WhatsApp', 'Chat with us, Mon to Sat', `https://wa.me/${STORE.whatsapp}`],
        [EnvelopeSimple, 'Email', STORE.email, `mailto:${STORE.email}`],
        [MapPin, 'Registered address', `${S.legalName}, ${S.address}`, null],
      ].map(([Icon, t, v, href]) => (
        <div key={t} className="flex gap-3 rounded-2xl bg-surface p-5 shadow-soft">
          <Icon size={24} className="shrink-0 text-coral-600" />
          <div className="text-sm"><p className="font-extrabold">{t}</p>{href ? <a href={href} className="text-muted hover:text-ink">{v}</a> : <p className="text-muted">{v}</p>}</div>
        </div>
      ))}
      <div className="flex gap-3 rounded-2xl border-2 border-dashed border-line p-5 md:col-span-2">
        <UserCircle size={24} className="shrink-0 text-coral-600" />
        <div className="text-sm">
          <p className="font-extrabold">Grievance officer</p>
          <p className="text-muted">As required by the Consumer Protection (E-Commerce) Rules, 2020.</p>
          <p className="mt-2">{G.name}<br />{G.email}, {G.phone}<br />{G.hours}</p>
        </div>
      </div>
    </div>
  )
}

function SizeGuide() {
  return (
    <div className="flex flex-col gap-8">
      {[['Clothing', CLOTHING_CHART, ['Size', 'Height (cm)', 'Chest (cm)', 'Waist (cm)', 'Weight'], (r) => [r.size, r.height, r.chest, r.waist, r.weight]],
        ['Footwear', FOOTWEAR_CHART, ['Size', 'UK size', 'Foot length (cm)'], (r) => [r.size, r.uk, r.foot]]].map(([t, rows, head, cells]) => (
        <section key={t}>
          <h2 className="mb-3 text-xl font-bold">{t}</h2>
          <div className="overflow-x-auto rounded-2xl bg-surface p-4 shadow-soft">
            <table className="w-full min-w-[460px] text-left text-sm">
              <thead><tr className="text-xs text-muted">{head.map((h) => <th key={h} className="py-2 pr-3 font-bold">{h}</th>)}</tr></thead>
              <tbody>{rows.map((r) => <tr key={r.size} className="border-t border-line">{cells(r).map((c, i) => <td key={i} className={`py-2.5 pr-3 ${i === 0 ? 'font-bold' : ''}`}>{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}

const TITLES = { contact: 'Contact us', faq: 'Frequently asked questions', 'size-guide': 'Size guide' }

export default function StaticPage() {
  const { slug } = useParams()
  const page = PAGES[slug]
  const title = page?.title || TITLES[slug]
  useEffect(() => { if (title) document.title = `${title} | KiDDY WiDDY` }, [title])
  if (!title) return <NotFound />

  return (
    <div className="container-x max-w-3xl pb-12 pt-6">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: title }]} />
      <h1 className="mb-6 mt-3 text-3xl font-extrabold md:text-4xl">{title}</h1>
      {page && (
        <>
          <div className="flex flex-col gap-6">
            {page.sections.map(([h, p]) => (
              <section key={h}>
                <h2 className="text-lg font-bold">{h}</h2>
                <p className="mt-1.5 leading-relaxed text-muted">{p}</p>
              </section>
            ))}
          </div>
          <p className="mt-10 rounded-xl bg-sunny-50 px-4 py-3 text-sm text-sunny-700">Sample policy text for this demo. Final wording should be reviewed by the store's lawyer and CA. Questions? <Link to="/pages/contact" className="font-bold underline">Contact us</Link>.</p>
        </>
      )}
      {slug === 'contact' && <Contact />}
      {slug === 'size-guide' && <SizeGuide />}
      {slug === 'faq' && (
        <div className="flex flex-col gap-2">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group rounded-2xl bg-surface px-5 shadow-soft">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-bold">{q}<CaretDown size={16} className="shrink-0 transition group-open:rotate-180" /></summary>
              <p className="pb-4 text-sm leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      )}
    </div>
  )
}
