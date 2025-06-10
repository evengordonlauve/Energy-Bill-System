import { FormEvent, ChangeEvent, useState } from "react";
import Layout from "../../components/Layout";

export default function Settings() {
  const [title, setTitle] = useState<string>("Calculation Portal");
  const [enableReg, setEnableReg] = useState<boolean>(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("Demo save not implemented");
  };

  return (
    <Layout>
      <h1>System Settings</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Portal Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setTitle(e.target.value)
            }
          />
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={enableReg}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEnableReg(e.target.checked)
              }
            />
            Enable User Registration
          </label>
        </div>
        <button type="submit" className="button">
          Save
        </button>
      </form>
    </Layout>
  );
}
