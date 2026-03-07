export default async function Page() {
    return (
        <div className="p-10">
            <h1>Database schema migrations must be run in the Supabase Dashboard.</h1>
            <p>Please open the Supabase SQL Editor and run the contents of <code>supabase/migrations/20260307000000_sin_encryption.sql</code></p>
        </div>
    )
}
