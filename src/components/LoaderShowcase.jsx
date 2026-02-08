import React from 'react';
import { TechLoader, CodeFlowLoader, NetworkLoader } from './TechLoader';

/**
 * Loader Showcase Component
 * Displays all available loader variants for testing and demonstration
 */
export const LoaderShowcase = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Technical IoT Loader Components
          </h1>
          <p className="text-gray-600 text-lg">
            Modern, animated loaders designed for IoT and tech applications
          </p>
        </div>

        {/* TechLoader Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <i className="fas fa-microchip"></i>
            </span>
            TechLoader (Default)
          </h2>
          <p className="text-gray-600 mb-8">
            Circuit board design with IoT device icon, rotating rings, and connection nodes
          </p>

          {/* Size Variants */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-6 mb-3">
                <TechLoader size="xs" text="" />
              </div>
              <div className="text-sm font-semibold text-gray-700">Extra Small</div>
              <div className="text-xs text-gray-500">size="xs"</div>
            </div>

            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-6 mb-3">
                <TechLoader size="sm" text="" />
              </div>
              <div className="text-sm font-semibold text-gray-700">Small</div>
              <div className="text-xs text-gray-500">size="sm"</div>
            </div>

            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-6 mb-3">
                <TechLoader size="md" text="" />
              </div>
              <div className="text-sm font-semibold text-gray-700">Medium</div>
              <div className="text-xs text-gray-500">size="md" (default)</div>
            </div>

            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-6 mb-3">
                <TechLoader size="lg" text="" />
              </div>
              <div className="text-sm font-semibold text-gray-700">Large</div>
              <div className="text-xs text-gray-500">size="lg"</div>
            </div>

            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-6 mb-3">
                <TechLoader size="xl" text="" />
              </div>
              <div className="text-sm font-semibold text-gray-700">Extra Large</div>
              <div className="text-xs text-gray-500">size="xl"</div>
            </div>
          </div>

          {/* With Text */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-lg p-8">
              <TechLoader size="lg" text="Loading dashboard..." textPosition="bottom" />
            </div>
            <div className="bg-gray-50 rounded-lg p-8">
              <TechLoader size="lg" text="Loading dashboard..." textPosition="top" />
            </div>
          </div>

          {/* Code Example */}
          <div className="mt-6 bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-green-400 text-sm">
              <code>{`import { TechLoader } from '../components/TechLoader';

<TechLoader size="lg" text="Loading..." textPosition="bottom" />`}</code>
            </pre>
          </div>
        </div>

        {/* CodeFlowLoader Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white">
              <i className="fas fa-code"></i>
            </span>
            CodeFlowLoader
          </h2>
          <p className="text-gray-600 mb-8">
            Binary code streaming effect with microchip icon - perfect for data processing
          </p>

          {/* Size Variants */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-6 mb-3">
                <CodeFlowLoader size="xs" text="" />
              </div>
              <div className="text-sm font-semibold text-gray-700">Extra Small</div>
            </div>

            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-6 mb-3">
                <CodeFlowLoader size="sm" text="" />
              </div>
              <div className="text-sm font-semibold text-gray-700">Small</div>
            </div>

            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-6 mb-3">
                <CodeFlowLoader size="md" text="" />
              </div>
              <div className="text-sm font-semibold text-gray-700">Medium</div>
            </div>

            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-6 mb-3">
                <CodeFlowLoader size="lg" text="" />
              </div>
              <div className="text-sm font-semibold text-gray-700">Large</div>
            </div>

            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-6 mb-3">
                <CodeFlowLoader size="xl" text="" />
              </div>
              <div className="text-sm font-semibold text-gray-700">Extra Large</div>
            </div>
          </div>

          {/* With Text */}
          <div className="bg-gray-50 rounded-lg p-8">
            <CodeFlowLoader size="lg" text="Processing data..." />
          </div>

          {/* Code Example */}
          <div className="mt-6 bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-green-400 text-sm">
              <code>{`import { CodeFlowLoader } from '../components/TechLoader';

<CodeFlowLoader size="lg" text="Processing data..." />`}</code>
            </pre>
          </div>
        </div>

        {/* NetworkLoader Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white">
              <i className="fas fa-network-wired"></i>
            </span>
            NetworkLoader
          </h2>
          <p className="text-gray-600 mb-8">
            Network topology with data packets - ideal for connectivity and device communication
          </p>

          {/* Size Variants */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-6 mb-3">
                <NetworkLoader size="xs" text="" />
              </div>
              <div className="text-sm font-semibold text-gray-700">Extra Small</div>
            </div>

            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-6 mb-3">
                <NetworkLoader size="sm" text="" />
              </div>
              <div className="text-sm font-semibold text-gray-700">Small</div>
            </div>

            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-6 mb-3">
                <NetworkLoader size="md" text="" />
              </div>
              <div className="text-sm font-semibold text-gray-700">Medium</div>
            </div>

            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-6 mb-3">
                <NetworkLoader size="lg" text="" />
              </div>
              <div className="text-sm font-semibold text-gray-700">Large</div>
            </div>

            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-6 mb-3">
                <NetworkLoader size="xl" text="" />
              </div>
              <div className="text-sm font-semibold text-gray-700">Extra Large</div>
            </div>
          </div>

          {/* With Text */}
          <div className="bg-gray-50 rounded-lg p-8">
            <NetworkLoader size="lg" text="Connecting to devices..." />
          </div>

          {/* Code Example */}
          <div className="mt-6 bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-green-400 text-sm">
              <code>{`import { NetworkLoader } from '../components/TechLoader';

<NetworkLoader size="lg" text="Connecting to devices..." />`}</code>
            </pre>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold mb-2">High Performance</h3>
              <p className="text-blue-100 text-sm">
                Pure CSS animations with no JavaScript overhead. Optimized for 60fps smooth animations.
              </p>
            </div>

            <div>
              <div className="text-4xl mb-3">📱</div>
              <h3 className="text-lg font-semibold mb-2">Fully Responsive</h3>
              <p className="text-blue-100 text-sm">
                Works perfectly on all devices from mobile phones to large desktop screens.
              </p>
            </div>

            <div>
              <div className="text-4xl mb-3">♿</div>
              <h3 className="text-lg font-semibold mb-2">Accessible</h3>
              <p className="text-blue-100 text-sm">
                Includes proper ARIA labels and screen reader support for accessibility compliance.
              </p>
            </div>

            <div>
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="text-lg font-semibold mb-2">AdminLTE Colors</h3>
              <p className="text-blue-100 text-sm">
                Uses the AdminLTE v3 color palette for consistent branding across the application.
              </p>
            </div>

            <div>
              <div className="text-4xl mb-3">🔧</div>
              <h3 className="text-lg font-semibold mb-2">Easy to Use</h3>
              <p className="text-blue-100 text-sm">
                Simple API with intuitive props. Drop-in replacement for existing loaders.
              </p>
            </div>

            <div>
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="text-lg font-semibold mb-2">Lightweight</h3>
              <p className="text-blue-100 text-sm">
                SVG-based graphics with minimal DOM elements. No external dependencies required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoaderShowcase;
