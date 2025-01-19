# ZincJo Platform Clone
This is a clone of the [ZincJo](https://zinc.jo/) platform. It is built with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/).

## Features
- Authentication (OAuth, 2FA, email verification, password reset)
- Profile Management
- Posts, Meetings, Events, Surveys, Bookings
- Private Messages

## Project Structure and Methodologies
This structure is mostly made through combining multiple approaches, from the official [Next.js](https://nextjs.org/) docs, [shadcn UI](https://ui.shadcn.com/) docs, and the [Atomic Design Approach](https://bradfrost.com/blog/post/atomic-web-design/) blog post.



The main idea is to have a structure that is easy to navigate and understand, and that is also scalable. 

### Folder Tree
Here is a brief overview of the project structure (src folder):
```bash
├── actions
├── app
├── components
│   ├── atoms
│   ├── molecules
│   └── pages
├── features
├── db
├── lib
├── styles
├── types
└── tests
```
### Folder Description
Here is a brief description of each folder:
 - 🎬 **actions**: the 'controller' layer.
 - :globe_with_meridians: **app**: the 'view' layer.
 - :jigsaw: **components**: reusable components, follows *Atomic Design Approach*:
   - :atom_symbol: **atoms**: styled html elements (ui components like buttons, inputs, etc).
   - :dna: **molecules**: small components that are used to compose larger components.
   - :page_facing_up: **pages**: the real representative content in place of the composed of organisms.
 - :sparkles: **features**: business rules used to compose **actions**.
 - 📦 **db**: contains database connection, schemas, and operations.
 - :hammer_and_wrench: **lib**: utilities that is used across the app
 - :test_tube: **tests**: unit tests and integration tests.
 - :art: **styles**: extra styles that can't be done through tailwindcss.
 - :label: **types**: typescript types that are usable across the app.