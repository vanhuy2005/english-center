import { useNavigate } from "react-router-dom";
import { Card, Button } from "@components/common";

const PlaceholderPage = ({ title = "Trang đang phát triển" }) => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <Card>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600 mb-6">
            Trang này đang được phát triển và sẽ sớm ra mắt
          </p>
          <Button variant="primary" onClick={() => navigate("/dashboard")}>
            Quay về Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PlaceholderPage;
