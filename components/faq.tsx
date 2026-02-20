'use client';

import { Disclosure } from '@headlessui/react';
import { MinusSmallIcon, PlusSmallIcon } from '@heroicons/react/24/outline';

const faqs = [
    {
        question: "How do I know which plan is right for me?",
        answer:
            "You don't need to guess. Start by uploading your documents. Our system analyzes your slips (T4, T5, Business income, etc.) and automatically matches you with the correct plan. You will never overpay for features you don't need.",
    },
    {
        question: "Can I just hand you a box of physical receipts?",
        answer:
            "Yes. If you prefer not to scan documents, you can schedule a secure courier pickup. We will collect your documents, digitize them, and prepare your return.",
    },
    {
        question: "What if I have a complex corporate return?",
        answer:
            "Our Plus and Pro plans cover most self-employment and rental scenarios. For complex corporate structures, we recommend booking a consultation with a VSF Tax Professional.",
    },
    {
        question: "How long does the process take?",
        answer:
            "Most returns are prepared for review within 3-5 business days of receiving your complete documentation.",
    },
];

export default function FAQ() {
    return (
        <div className="bg-white">
            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
                <div className="mx-auto max-w-4xl divide-y divide-gray-900/10">
                    <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900 text-center mb-10 font-manrope">
                        Frequently Asked Questions
                    </h2>
                    <dl className="mt-10 space-y-6 divide-y divide-gray-900/10">
                        {faqs.map((faq) => (
                            <Disclosure as="div" key={faq.question} className="pt-6">
                                {({ open }) => (
                                    <>
                                        <dt>
                                            <Disclosure.Button className="flex w-full items-start justify-between text-left text-gray-900">
                                                <span className="text-base font-semibold leading-7">{faq.question}</span>
                                                <span className="ml-6 flex h-7 items-center">
                                                    {open ? (
                                                        <MinusSmallIcon className="h-6 w-6" aria-hidden="true" />
                                                    ) : (
                                                        <PlusSmallIcon className="h-6 w-6" aria-hidden="true" />
                                                    )}
                                                </span>
                                            </Disclosure.Button>
                                        </dt>
                                        <Disclosure.Panel as="dd" className="mt-2 pr-12">
                                            <p className="text-base leading-7 text-gray-600">{faq.answer}</p>
                                        </Disclosure.Panel>
                                    </>
                                )}
                            </Disclosure>
                        ))}
                    </dl>
                </div>
            </div>
        </div>
    );
}
