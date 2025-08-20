'use client';

const MessageList = () => {
    return (
        <div className="flex flex-col gap-2
                        mt-6 px-4
                        overflow-y-auto
                        h-full w-full">
            <div className="text-sm text-gray-500 text-center py-4">
                Chat history will appear here
            </div>
        </div>
    )
}

export default MessageList;