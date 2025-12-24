import CommunityChallenges from '../components/CommunityChallenges';

const CommunityChallengePage = () => {
  return (
    <div className="min-h-screen bg-base-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">🌍 Community Wellness Challenges</h1>
          <p className="text-base-content/70">
            Join millions worldwide in global wellness competitions. Track progress, earn rewards, and make wellness fun!
          </p>
        </div>
        
        <CommunityChallenges />
      </div>
    </div>
  );
};

export default CommunityChallengePage;