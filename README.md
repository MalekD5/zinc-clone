# ZincJo Platform Clone
This is a clone of the [ZincJo](https://zincjo.com/) platform. It is built with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/).

## Features
- Authentication (OAuth, 2FA, email verification, password reset)
- Profile Page
- Posts, Meetings, Events, Surveys, Bookings Page
- Private Messages

## Project Structure
This structure is mostly made through combining multiple approaches, from the official [Next.js](https://nextjs.org/) docs, [shadcn UI](https://ui.shadcn.com/) docs, and the [Atomic Design Approach](https://bradfrost.com/blog/post/atomic-web-design/) blog post.

The main idea is to have a structure that is easy to navigate and understand, and that is also scalable. Here is a brief overview of the project structure:
 - :globe_with_meridians: **app**: the 'view' layer
 - :jigsaw: **components**: reusable components, follows *Atomic Design Approach*:
   - :atom_symbol: **atoms**: styled html elements (ui components like buttons, inputs, etc)
   - :dna: **molecules**: small components that are used to compose larger components
   - :evergreen_tree: **organisms**: larger components that are composed of smaller components
   - :world_map: **templates**: pages that are composed of organisms
   - :page_facing_up: **pages**: the real representative content in place of templates
 - :sparkles: **features**: features that are used to compose pages ``
 - :oil_drum: **db**: contains database connection and schemas
 - :hammer_and_wrench: **lib**: reusable code that is used across the app
 - :label: **types**: typescript types that are usable across the app