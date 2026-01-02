export function ErrorState({ error }: { error: unknown }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
        <svg
          className="w-8 h-8 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p className="text-red-600 text-base font-semibold mb-2">
        មានកំហុសក្នុងការផ្ទុកមីនុយ
      </p>
      <p className="text-red-400 text-sm">{String(error)}</p>
    </div>
  );
}

