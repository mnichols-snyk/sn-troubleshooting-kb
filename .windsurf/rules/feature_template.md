Hello Windsurf. We are about to begin development on the next feature. Please follow these steps in the exact order specified. I will provide a `CHECKPOINT` after each major step for you to confirm completion before we proceed.

**Feature:** [Provide the feature name, e.g., "Coach can archive a workout"]
**Source Task:** [Reference the task from your project_plan.md, e.g., "Phase 3.3: Develop API for coaches to archive workouts"]
**Description:** [Briefly describe what needs to be done, e.g., "We need to add a flag to the Workout model to mark it as archived and create an API endpoint for a coach to set this flag."]

---
**STEP 1: SCHEMA CHANGE**
1.  Open the Prisma schema file at `apps/backend/prisma/schema.prisma`.
2.  In the `[Model Name]` model, add the following field definition:
    ```prisma
    [Field name and type, e.g., isArchived Boolean @default(false)]
    ```
3.  Let me know when you have made the change.

**CHECKPOINT 1:** Please confirm the schema file has been updated.

---
**STEP 2: DATABASE MIGRATION**
1.  In the `apps/backend` directory, execute the following command to create the migration:
    ```bash
    npx prisma migrate dev --name [migration_name_e.g., add_is_archived_to_workouts]
    ```
2.  Confirm that the migration file was created successfully in the `prisma/migrations` directory.

**CHECKPOINT 2:** Please confirm the migration command completed successfully.

---
**STEP 3: GENERATE & SHARE TYPES**
1.  In the `apps/backend` directory, execute the command: `npx prisma generate`
2.  This will update the Prisma Client types to include our new field.

**CHECKPOINT 3:** Please confirm the Prisma Client has been regenerated.

---
**STEP 4: BACKEND IMPLEMENTATION**
1.  Now, create or modify the API endpoint to use the new field.
2.  **File to modify/create:** `[File path, e.g., apps/backend/src/api/routes/workouts.ts]`
3.  **Endpoint:** `[HTTP Method and path, e.g., PATCH /api/workouts/:id/archive]`
4.  **Logic:**
    - The endpoint should be protected and only accessible by a user with the 'COACH' role.
    - It should find the workout by its ID.
    - It should update the `[Field name]` to `true`.
    - It should return the updated workout object.
5.  Implement this logic now.

**CHECKPOINT 4:** Please confirm the backend API endpoint has been implemented.

---
**STEP 5: FRONTEND IMPLEMENTATION (Optional - can be a separate task)**
1.  **File to modify/create:** `[File path, e.g., apps/frontend/src/components/WorkoutCard.tsx]`
2.  **Logic:**
    - Add a new "Archive" button to the component.
    - When the button is clicked, it should call the new backend API endpoint (`[HTTP Method and path]`).
    - After a successful API call, the UI should either hide the workout or display it differently to indicate it's archived.

**CHECKPOINT 5:** Please confirm the frontend changes have been made.