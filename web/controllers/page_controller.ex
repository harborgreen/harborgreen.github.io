defmodule Mlrecycle.PageController do
  use Mlrecycle.Web, :controller

  plug :action

  def index(conn, _params) do
    render conn, "index.html"
  end
end
