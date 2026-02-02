import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function TestIndex() {
    console.log('✅ TestIndex rendering...');

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-black text-white">
            <div className="text-center">
                <h1 className="text-4xl mb-4">Test Page Works!</h1>
                <p>If you see this, React is rendering correctly</p>
            </div>
        </div>
    );
}
