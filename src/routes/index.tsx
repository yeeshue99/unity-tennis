import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import SwipeableViews from 'react-swipeable-views'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const testimonials = [
    {
      text: 'Isaac’s coaching has transformed my game. His passion for tennis is contagious!',
      author: 'A Happy Student',
    },
    {
      text: 'My kids love Isaac’s classes. They’ve improved so much and have so much fun!',
      author: 'A Grateful Parent',
    },
    {
      text: 'Isaac’s dedication to the community and his students is truly inspiring.',
      author: 'A Local Resident',
    },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  const handleChangeIndex = (index: number) => {
    setCurrentIndex(index)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [testimonials.length])

  return (
    <main className="max-w-4xl mx-auto p-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-4">
          Isaac Yarell — Tennis Coach
        </h1>
        <p className="text-lg text-(--color-text-muted) mb-6">
          Isaac Yarell is a passionate tennis coach and the director of UnITY
          Tennis, Merced’s only year-round public tennis program. With a mission
          to make tennis accessible to everyone, Isaac offers personalized
          coaching for players of all ages and skill levels.
        </p>
        <div className="flex justify-center gap-4">
          <a
            className="bg-(--color-primary) text-white px-6 py-3 rounded-md hover:bg-(--color-primary-hover) transition-colors"
            href="mailto:yarrelltennis@gmail.com?subject=Coaching%20Inquiry"
          >
            Contact Isaac
          </a>
          <Link
            to="/tournaments"
            className="border border-(--color-border) text-(--color-text) px-6 py-3 rounded-md hover:bg-(--color-surface-2) transition-colors"
          >
            View Local Leagues!
          </Link>
        </div>
      </section>

      <section id="about" className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">About Isaac</h2>
        <p className="text-(--color-text-muted)">
          Isaac Yarell began playing tennis at the age of six, inspired by his
          father. Growing up in a challenging neighborhood in Cincinnati, tennis
          provided him with a safe haven and a sense of community. He went on to
          gain national exposure, compete in state finals, and play throughout
          college, visiting 39 states in the process. After serving as the
          Tennis Director at Concourse Athletic Club in Atlanta, Isaac moved to
          Merced in 2016 to pursue his passion for tennis and community
          engagement.
        </p>
      </section>

      <section id="services" className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Coaching Services</h2>
        <ul className="space-y-4 text-(--color-text-muted)">
          <li>
            <strong>Adult Beginner Classes:</strong> Sundays, 9AM to 10AM, $15
            per class.
          </li>
          <li>
            <strong>Adult Drill and Play:</strong> Sundays, 10AM to 11:30AM, $20
            per class.
          </li>
          <li>
            <strong>Junior Classes:</strong>
            <ul className="pl-4 list-disc">
              <li>
                Merced Group (Ages 5-7): Mondays & Fridays, 4PM to 5PM,
                $75/month (once a week) or $150/month (twice a week).
              </li>
              <li>
                California Group (Ages 8-10): Mondays & Wednesdays, 5PM to 6PM,
                Saturdays, 9AM to 10AM, $75/month (once a week) or $150/month
                (twice a week).
              </li>
              <li>
                California Green Group (Ages 9-12): Tuesdays & Thursdays, 4PM to
                5:30PM, Saturdays, 11AM to 12:30PM, $90/month (once a week) or
                $180/month (twice a week).
              </li>
              <li>
                United States Beginner Group (Ages 13-15): Wednesdays, 4PM to
                5PM, $75/month (once a week) or $150/month (twice a week).
              </li>
              <li>
                United States Advanced Group (Ages 11-15): Tuesdays & Thursdays,
                5:30PM to 7PM, Saturdays, 12:30PM to 2PM, $90/month (once a
                week) or $180/month (twice a week).
              </li>
              <li>
                World Group (Ages 11-16): Mondays & Wednesdays, 6PM to 7:30PM,
                Saturdays, 12:30PM to 2PM, $90/month (once a week) or $180/month
                (twice a week).
              </li>
            </ul>
          </li>
        </ul>
      </section>

      <section id="testimonials" className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Testimonials</h2>
        <SwipeableViews
          index={currentIndex}
          onChangeIndex={handleChangeIndex}
          enableMouseEvents
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-6 bg-(--color-surface-2) border border-(--color-border) rounded-lg shadow-md text-center"
            >
              <p className="text-(--color-text-muted) italic">
                "{testimonial.text}"
              </p>
              <p className="text-(--color-text) mt-4">— {testimonial.author}</p>
            </div>
          ))}
        </SwipeableViews>
      </section>

      <section id="contact" className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Get Started</h2>
        <p className="text-(--color-text-muted) mb-4">
          Schedule a trial lesson or ask questions.
        </p>
        <form
          className="grid grid-cols-1 gap-3 max-w-xl"
          onSubmit={(e) => {
            e.preventDefault()
            const form = e.currentTarget as HTMLFormElement
            const fm = new FormData(form)
            const name = fm.get('name') || ''
            const email = fm.get('email') || ''
            const msg = fm.get('message') || ''
            const body = encodeURIComponent(
              `Name: ${name}\nEmail: ${email}\n\n${msg}`,
            )
            window.location.href = `mailto:yarrelltennis@gmail.com?subject=Coaching%20Request&body=${body}`
          }}
        >
          <input
            name="name"
            placeholder="Your name"
            className="border border-(--color-border) bg-(--color-surface) text-(--color-text) placeholder:text-(--color-text-muted) px-3 py-2 rounded"
          />
          <input
            name="email"
            placeholder="Your email"
            className="border border-(--color-border) bg-(--color-surface) text-(--color-text) placeholder:text-(--color-text-muted) px-3 py-2 rounded"
          />
          <textarea
            name="message"
            rows={4}
            placeholder="Message"
            className="border border-(--color-border) bg-(--color-surface) text-(--color-text) placeholder:text-(--color-text-muted) px-3 py-2 rounded"
          />
          <div>
            <button className="bg-(--color-primary) hover:bg-(--color-primary-hover) text-white px-4 py-2 rounded transition-colors">
              Send
            </button>
          </div>
        </form>
      </section>

      <footer className="text-sm text-(--color-text-muted) mt-12">
        © Isaac Yarell Coaching
      </footer>
    </main>
  )
}
